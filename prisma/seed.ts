import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

const adapter = new PrismaNeon({ connectionString: url.trim() })
const prisma = new PrismaClient({ adapter })

const sampleNotes = [
  {
    title: "Welcome to Cloud Notes",
    content: `# Welcome! 🎉

This is your new **cloud-synced** notes app. Here are a few things you can do:

- **Create notes** — Click the + button to start writing
- **Favorite notes** — Star important notes to find them quickly
- **Trash notes** — Delete notes you no longer need (they'll be safe in the trash)
- **Search** — Filter through all your notes instantly

Everything syncs to the cloud automatically via **Neon PostgreSQL**. No more losing your work!`,
    isFavorite: true,
  },
  {
    title: "Project Ideas Q3",
    content: `## Q3 Project Brainstorm

1. **Personal Dashboard** — Aggregate all my tools into one place
   - Weather, calendar, tasks, notes
   - Custom widgets with drag & drop

2. **Recipe Manager** — Family recipe collection
   - Ingredient scaling
   - Meal planning calendar
   - Shopping list generator

3. **Fitness Tracker** — Simple workout logging
   - Progressive overload tracking
   - Body measurements charts
   - Custom routine builder`,
    isFavorite: true,
  },
  {
    title: "Meeting Notes — Design Review",
    content: `## Design Review — June 17, 2026

**Attendees:** Sarah, Mike, Alex, Jordan

### Feedback Summary

- **Typography** — Body text size bump to 16px approved
- **Color palette** — Need one more pass on dark mode contrast
- **Mobile nav** — Hamburger menu with slide-out drawer ✅
- **Loading states** — Add skeleton screens (assigned to Mike)

### Action Items
- [x] Update figma with new type scale
- [ ] Audit all pages for dark mode contrast issues
- [ ] Prototype mobile nav interaction`,
    isFavorite: false,
  },
  {
    title: "Shopping List",
    content: `## Groceries

- [ ] Eggs (1 dozen)
- [ ] Avocados (3)
- [ ] Sourdough bread
- [ ] Olive oil
- [ ] Cherry tomatoes
- [ ] Fresh basil
- [ ] Parmigiano-Reggiano
- [ ] Garlic
- [ ] Lemons (2)
- [ ] Dark chocolate (85%)`,
    isFavorite: false,
  },
  {
    title: "Book Notes: Atomic Habits",
    content: `## Key Takeaways from Atomic Habits

### The Four Laws of Behavior Change

1. **Make it Obvious**
   - Design your environment for success
   - Implementation intentions: "I will [BEHAVIOR] at [TIME] in [LOCATION]"

2. **Make it Attractive**
   - Temptation bundling: pair habits you need with habits you want
   - Join cultures where your desired behavior is normal

3. **Make it Easy**
   - The 2-minute rule: scale down habits until they take <2 minutes
   - Automate as much as possible

4. **Make it Satisfying**
   - Use visual measures (paper clips, habit tracker)
   - Never miss twice — just get back on track`,
    isFavorite: true,
  },
  {
    title: "Weather App API Research",
    content: `## Weather API Comparison

| API | Free Tier | Accuracy | Docs |
|-----|-----------|----------|------|
| OpenWeatherMap | 60 calls/min | Good | ★★★★ |
| WeatherAPI | 1M calls/mo | Great | ★★★★★ |
| Visual Crossing | 1000 calls/day | Very Good | ★★★ |

**Decision:** Going with WeatherAPI for the hackathon project. Best docs and generous free tier.`,
    isFavorite: false,
  },
  {
    title: "Random Thoughts",
    content: `- Learned how to make proper pasta aglio e olio this weekend — life changing
- Should I switch to a split keyboard? My wrists are complaining
- The new Framework laptop looks amazing but do I really need it? (don't answer that)
- Started learning Go — the error handling actually makes sense now
- Note to self: renew passport before the summer trip`,
    isFavorite: false,
  },
  {
    title: "Old Todo List (April)",
    content: `## April 2026 — Done ✅

- ~~Fix login page redirect bug~~
- ~~Write API docs for the team~~
- ~~Set up CI/CD pipeline~~
- ~~Migrate database to Neon~~
- ~~Review pull requests~~
- ~~Clean up unused dependencies~~
- ~~Refactor auth middleware~~`,
    isDeleted: true,
  },
]

async function main() {
  console.log("🌱 Seeding database with sample notes...\n")

  // Clear existing notes
  const deleted = await prisma.note.deleteMany()
  console.log(`  Cleared ${deleted.count} existing notes`)

  // Insert sample notes
  for (const note of sampleNotes) {
    const created = await prisma.note.create({
      data: note,
    })
    console.log(`  ✓ Created: "${created.title}"${note.isDeleted ? " (trashed)" : note.isFavorite ? " ⭐" : ""}`)
  }

  console.log(`\n✅ Seeding complete! ${sampleNotes.length} notes added.`)
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
