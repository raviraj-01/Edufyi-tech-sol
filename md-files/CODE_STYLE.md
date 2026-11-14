# Code style: write code that is yours

Reviewers usually spot generated code in seconds. The tell is not that AI was used. It is code the author cannot explain, written in a voice that does not match the rest of the repo. This file is about writing code you understand and that reads like one person wrote it.

One honest warning first. "Humanizing" does not mean adding random mess or hiding where code came from. It means reading, changing and understanding every line before it goes in. If you cannot explain a line, rewrite it until you can. Also check whether your internship allows AI help and whether they want it mentioned. If they do, say so in the README.

## 1. Naming

Short, plain, one word when possible. Same word for the same thing everywhere.

| Avoid | Use |
|---|---|
| `handleTimerInitializationLogic` | `startTimer` |
| `statisticsDataFetchResponse` | `res` or `stats` |
| `isUserCurrentlyAuthenticated` | `loggedIn` |
| `UserAuthenticationService` | `auth` |
| `processApplicationSubmissionData` | `submitApplication` |

Pick one vocabulary and keep it: `application` (not sometimes `submission`), `startup_name` (not sometimes `company`), `loadStats` / `loadPlans` (not a mix of `fetch`, `get`, `retrieve`).

Python: `snake_case`. JavaScript: `camelCase` for functions and variables, `kebab-case` for CSS classes. CSS class names describe the thing, not the look: `.stats-card`, not `.green-box`.

## 2. Comments

Comment the reason, not the action. If the code says it, the comment is noise.

```js
// bad: says what the code already says
// Loop through each plan and create a card
for (const plan of plans) { ... }

// good: says why
// the API can be slow on a cold start, so the page already has default numbers
if (!res.ok) return;
```

Rules:
- No comment on every function. One short line above tricky ones.
- No banner comments, no JSDoc on small functions.
- A real `TODO` is fine when it is real: `// TODO: move this to a shared constant`.
- Write comments in the way you would text a classmate. No em dashes, no formal phrases.

## 3. Shape of the code

Robotic:

```js
/**
 * Initializes the statistics card component by asynchronously fetching
 * data from the API endpoint and updating the DOM accordingly.
 */
async function initializeStatisticsCardComponent() {
  try {
    const response = await fetch("/api/stats");
    if (!response.ok) {
      throw new Error("Failed to fetch statistics data");
    }
    const data = await response.json();
    updateStatisticsCardDisplay(data);
  } catch (error) {
    console.error("An error occurred while initializing the statistics card:", error);
  }
}
```

Human:

```js
async function loadStats() {
  const res = await fetch("/api/stats");
  if (!res.ok) return; // keep the numbers already in the HTML
  showStats(await res.json());
}
```

Habits that make code read as yours:
- Small functions that do one thing, and you can say what it does in one sentence.
- Handle the errors that can really happen, not every error imaginable. A try/catch around everything is a tell.
- No helper layers you do not need. If a function is used once and is three lines, inline it.
- Keep your own style: same quote marks, same spacing, same way of writing conditions, everywhere.
- Delete unused code and unused imports before committing.

## 4. Git history

A real history is the best proof you built it.

- Commit as you work, small and often, at least once per TODO item.
- Messages in plain words: `add stats ring`, `fix modal not closing on Esc`, `stop count-up from running twice`.
- Do not squash everything into one commit on the last night.
- Do not rewrite or backdate history.
- Branch for bigger pieces if you like (`auth`, `hero-video`), merge when they work.

## 5. Viva prep: questions to answer out loud

Practice these without notes. If any answer is shaky, reread that file.

1. Why Flask and plain JS instead of React? What would change if you had to use React?
2. How does login work? What is in the cookie, and what stops someone editing it?
3. How are passwords stored? Why not plain text, and why not just a fast hash?
4. What happens when someone sends `{"email": {"$ne": null}}` to your login? Why is that safe here?
5. Walk me through what happens from clicking "Get Started" to the document appearing in MongoDB.
6. Why is the application status history embedded instead of its own collection?
7. How does the ring animation work? What is `stroke-dashoffset`?
8. Why does the stats card still look right when the API is down?
9. How did you make the hero video load fast? What is the poster for?
10. Why `mix-blend-mode: screen` on the video? What breaks if the video background is not near black?
11. How do you stop the contact form being spammed? What are the limits of your approach?
12. How did you test this? What is not tested?
13. What did you use AI for, and what did you change or reject? (Have a real answer.)
14. If you had one more week, what would you build next, and why?
15. What is the weakest part of this project?

## 6. Pre-submit code review checklist

- [ ] Every file: can I explain it in 2 minutes?
- [ ] No unused imports, files, or commented-out blocks
- [ ] No `console.log` left over
- [ ] Naming is consistent across front and back end
- [ ] No hardcoded secrets or URIs
- [ ] No comment that only repeats the code
- [ ] Same formatting everywhere (run a formatter: Prettier for JS and CSS, Black for Python)
- [ ] README matches what the code really does
