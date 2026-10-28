# Income Ledger (Vite + React)

A responsive income tracker built with Vite, React 18 and Bootstrap 5. You register **income categories**, then record **income transactions** under them. Totals, search, filters, editing and browser persistence are included.

This is the improved version of my **Midterm Income Ledger**. The midterm already used Vite + React, so I improved it instead of rebuilding it.


---

## Table of contents

1. [Project overview and objectives](#1-project-overview-and-objectives)
2. [Original features retained](#2-original-features-retained-from-the-midterm-project)
3. [New features added](#3-new-features-added-and-why)
4. [Technologies and tools](#4-technologies-and-tools)
5. [Folder structure](#5-project-folder-structure)
6. [Setup and installation](#6-setup-and-installation)
7. [Commands](#7-commands)
8. [React component architecture](#8-react-component-architecture)
9. [`useState` and how state updates the UI](#9-usestate-and-how-state-changes-update-the-ui)
10. [Events, validation, data flow, business logic](#10-event-handling-form-validation-data-flow-and-business-logic)
11. [File-by-file walkthrough](#11-feature-by-feature-walkthrough-of-important-files)
12. [AI assistance disclosure](#12-ai-assistance-disclosure)
13. [Code defense: likely instructor questions](#13-code-defense-likely-instructor-questions)
14. [Limitations, assumptions, future improvements](#14-limitations-assumptions-and-future-improvements)
15. [GitHub and Vercel](#15-github-publication-and-vercel-deployment)
16. [Testing and verification report](#16-testing-and-verification-report)

---

## 1. Project overview and objectives

**Purpose:** keep a clean record of where income comes from.

- A **category** is a source of income, such as "Consulting" with a description.
- A **transaction** is one amount of money received, with a date and optional note, filed under one category.

**Objectives**

1. Keep every behavior of the midterm category registration form and table.
2. Build the UI with React components and state (declarative rendering), not manual DOM changes.
3. Add features that make it a usable ledger: income transactions, totals, edit, search/filter, persistence.
4. Keep the code small enough for a student to read, explain and defend.
5. Make it ready for GitHub and Vercel.

## 2. Original features retained from the midterm project

I inspected the uploaded midterm ZIP first and wrote this checklist from its actual source code (`CategoryForm.jsx`, `useValidatedField.js`, `useCategories.js`, `CategoryTable.jsx`, `CategoryRow.jsx`, `EmptyRow.jsx`, `FormField.jsx`).

| # | Original feature | Still works? | Where it lives now |
|---|---|---|---|
| 1 | "Income Category Registration" card with **Category Name** and **Description** text inputs, labels and placeholders | Yes | `CategoryForm.jsx` |
| 2 | A field is invalid when blank or only spaces | Yes | `isFilled` in `utils/ledger.js` (same rule as the original `isFilled`) |
| 3 | Fields are validated **on blur** and **on save** | Yes | `useValidatedField.js` |
| 4 | After a field is flagged invalid, it is re-checked **while typing** | Yes | `onChange` in `useValidatedField.js` |
| 5 | Bootstrap `is-invalid` / `is-valid` styling and the messages "Please enter a category name." / "Please enter a description." | Yes | `FormField.jsx`, `CategoryForm.jsx` |
| 6 | Saving with an invalid field does **not** save and **focuses the first invalid field** | Yes | `handleSave` in `CategoryForm.jsx` |
| 7 | Values are **trimmed** before saving | Yes | `handleSave` |
| 8 | After saving: inputs cleared, validation styles cleared, Category Name refocused | Yes | `handleSave` |
| 9 | Each category gets a unique id (`crypto.randomUUID`) | Yes (with a fallback) | `createId` in `utils/ledger.js` |
| 10 | "Registered Categories" table with Name, Description, Action columns | Yes (one column added, see below) | `CategoryTable.jsx`, `CategoryRow.jsx` |
| 11 | **Delete** button per row | Yes (now asks to confirm) | `CategoryRow.jsx`, `App.jsx` |
| 12 | **Delete All** button, disabled when the list is empty | Yes (now asks to confirm) | `CategoryTable.jsx` |
| 13 | Empty-state row "No categories registered yet." | Yes | `EmptyRow.jsx` |
| 14 | Bootstrap look, `w-35` column width, focus-ring colors | Yes | `style.css` |
| 15 | Separation into components + custom hooks | Yes | `components/`, `hooks/` |

**Deliberate changes to original behavior (nothing was silently removed):**

- The category table has an extra **Income** column and the Action column now has **Edit** and **Delete**.
- Delete and Delete All now show a **confirmation dialog**.
- The Save button is now `type="submit"`, so pressing **Enter** in a field also saves. Before, only clicking the button worked.
- The form heading changed from `h1` to `h2` because the page now has its own `h1` ("Income Ledger"). The text is the same.
- Categories now persist in `localStorage`. Before, they disappeared on refresh.
- The page background moved from `<body class="bg-light py-5">` to `style.css`, and the page `<title>` is now "Income Ledger".
- The package name changed from `enterprise-income-tracker` to `income-ledger`.
- **Not changed:** duplicate category names are still allowed, exactly as in the midterm (see Limitations).

## 3. New features added and why

| Feature | Why it is useful | Files |
|---|---|---|
| **Income transactions** (category, amount, date, optional note) | A "ledger" needs amounts. Categories alone cannot record income. | `TransactionForm.jsx`, `TransactionTable.jsx`, `TransactionRow.jsx`, `useTransactions.js` |
| **Summary cards**: total income, this month, transaction count, top category | Shows the important numbers at a glance. | `SummaryCards.jsx` |
| **Per-category income total** and entry count in the category table | Shows which source earns the most. | `CategoryRow.jsx`, `totalsByCategory` |
| **Edit** categories and transactions | Fixes mistakes without delete and re-add. | `CategoryForm.jsx`, `TransactionForm.jsx`, `App.jsx` |
| **Search** categories; **filter** transactions by category and search notes; filtered total | Finds records quickly. | `CategoryTable.jsx`, `TransactionTable.jsx`, `filterCategories`, `filterTransactions` |
| **Newest-first** transaction order | Recent income is on top. | `sortTransactions` |
| **Confirmation dialog** for deletes (Escape and Cancel supported) | Prevents accidental data loss. | `ConfirmDialog.jsx` |
| **Toast notifications** | Gives feedback after save, update, delete. | `ToastContainer.jsx`, `useToasts.js` |
| **Persistence with `localStorage`** | Data survives refresh. Corrupted data falls back to empty. | `useLocalStorage.js` |
| **Responsive layout** and updated styling | Works on desktop, tablet, phone. | `App.jsx`, `style.css` |
| **Automated tests** (38) | Proves the original behavior and new features work. | `src/test/` |

**Cascade rule:** each transaction stores a `categoryId`. When a category is deleted, its transactions are deleted too, so no transaction is left without a category. The confirmation dialog tells the user how many transactions will go.

## 4. Technologies and tools

| Tool | Version installed | Purpose |
|---|---|---|
| React | 18.3.1 | Component UI and state |
| Vite | 5.4.21 | Dev server and production build |
| @vitejs/plugin-react | 4.7.0 | JSX support in Vite |
| Bootstrap | 5.3.8 | Styling (CSS only; no Bootstrap JavaScript is used) |
| Vitest | 2.1.9 | Test runner |
| @testing-library/react, user-event, jest-dom | 16.3.3 / 14.6.8 / 6.9.1 | Rendering and interacting with components in tests |
| jsdom | 25.0.1 | Fake browser for tests |
| Node.js / npm | 18+ required (built and tested with Node 22, npm 10) | Runtime and package manager |

The only runtime dependencies are `react`, `react-dom` and `bootstrap`, the same as the midterm. The new packages are test tools in `devDependencies`.

## 5. Project folder structure

```
income-ledger/
├── index.html                 # Vite entry page with <div id="root">
├── package.json               # scripts and dependencies
├── package-lock.json          # exact dependency versions
├── vite.config.js             # Vite + React plugin + Vitest settings
├── .gitignore
├── README.md
└── src/
    ├── main.jsx               # mounts <App /> into #root
    ├── App.jsx                # top-level state coordination
    ├── components/
    │   ├── CategoryForm.jsx       # add / edit category (original, extended)
    │   ├── CategoryTable.jsx      # category list + search (original, extended)
    │   ├── CategoryRow.jsx        # one category row (original, extended)
    │   ├── EmptyRow.jsx           # empty-state row (original, extended)
    │   ├── FormField.jsx          # label + input/select + error (original, extended)
    │   ├── TransactionForm.jsx    # add / edit transaction (new)
    │   ├── TransactionTable.jsx   # transaction list + filters + total (new)
    │   ├── TransactionRow.jsx     # one transaction row (new)
    │   ├── SummaryCards.jsx       # dashboard numbers (new)
    │   ├── ConfirmDialog.jsx      # delete confirmation modal (new)
    │   └── ToastContainer.jsx     # notifications (new)
    ├── hooks/
    │   ├── useValidatedField.js   # field value + validation status (original, extended)
    │   ├── useCategories.js       # category state (original, extended)
    │   ├── useTransactions.js     # transaction state (new)
    │   ├── useLocalStorage.js     # useState saved to localStorage (new)
    │   └── useToasts.js           # notification queue (new)
    ├── utils/
    │   └── ledger.js              # pure business logic (new)
    ├── styles/
    │   └── style.css
    └── test/
        ├── setup.js
        ├── ledger.test.js         # 13 unit tests
        └── App.test.jsx           # 25 user-flow tests
```

## 6. Setup and installation

Requirements: **Node.js 18 or newer** (https://nodejs.org) and npm (installed with Node). Check with:

```bash
node -v
npm -v
```

Unzip the project, open a terminal in the `income-ledger` folder, then:

```bash
npm install
```

## 7. Commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server (Vite prints the local address, usually http://localhost:5173) |
| `npm run build` | Creates the production build in `dist/` |
| `npm run preview` | Serves the built `dist/` folder locally to check the production build |
| `npm test` | Runs all tests once |
| `npm run test:watch` | Re-runs tests when files change |

## 8. React component architecture

```
App                       <- owns ALL data state (via hooks) and the dialog/edit state
├── SummaryCards          <- reads categories + transactions, shows totals
├── CategoryForm          <- add/edit a category
│   └── FormField (x2)
├── CategoryTable         <- list + search box (search text is local state)
│   └── CategoryRow (xN) / EmptyRow
├── TransactionForm       <- add/edit a transaction
│   └── FormField (x4)
├── TransactionTable      <- list + filters (filter state is local)
│   └── TransactionRow (xN) / EmptyRow
├── ConfirmDialog         <- shown when `dialog` state is not null
└── ToastContainer        <- shows the toast queue
```

**Design decisions**

- **Presentation vs. state vs. logic.** Components draw the UI. Hooks (`src/hooks/`) hold state. Pure functions (`src/utils/ledger.js`) hold calculations and rules. This is why `ledger.test.js` can test the rules without React.
- **State lives in `App` for shared data.** Categories and transactions are used by several components (forms, tables, summary cards), so `App` owns them and passes data and handler functions down as props ("lifting state up").
- **State lives in a component when only that component needs it.** The search text of `CategoryTable` and the filters of `TransactionTable` are local, because nothing else needs them.
- **Derived data is not stored.** Totals, counts, filtered lists and the top category are calculated from the state on every render, so they can never get out of sync.

## 9. `useState` and how state changes update the UI

`useState` gives a component a value that React remembers between renders, plus a setter function. When the setter is called, React re-runs the component and updates the screen to match the new state. I never edit the DOM by hand.

The core of the app is `useCategories.js` (`useLocalStorage` is a wrapper around `useState`, shown in Section 11):

```js
export function useCategories() {
  const [categories, setCategories] = useLocalStorage(CATEGORIES_KEY, []);

  const addCategory = useCallback(
    ({ name, description }) => {
      const category = { id: createId(), name, description };
      setCategories((prev) => [...prev, category]);
      return category;
    },
    [setCategories]
  );
  // ...
}
```

**What happens when I save a category**

1. I click **Save Category** (or press Enter). `handleSave` in `CategoryForm` runs.
2. It calls `onAdd(...)`, which is `handleAddCategory` in `App`, which calls `addCategory`.
3. `setCategories((prev) => [...prev, category])` creates a **new array** with the new category added. State is never mutated directly; React notices the new array and re-renders.
4. `CategoryTable` receives the new `categories` prop and renders one more `CategoryRow`. `EmptyRow` disappears because `categories.length` is no longer 0.
5. `SummaryCards` and the category dropdown in `TransactionForm` also re-render because they receive the same state.
6. `useLocalStorage`'s `useEffect` runs after the render and saves the array to `localStorage`.

Other `useState` uses:

| Where | State | Controls |
|---|---|---|
| `useValidatedField` | `value`, `status` | Input text and `is-valid`/`is-invalid` class |
| `App` | `editingCategoryId`, `editingTransactionId` | Which record is loaded in a form |
| `App` | `dialog` | Whether the confirmation dialog shows, and what it says |
| `CategoryTable` | `query` | Category search text |
| `TransactionTable` | `categoryId`, `query` | Transaction filters |
| `TransactionForm` | `note` | The optional note field |
| `useToasts` | `toasts` | Notification queue |

Two other hooks:

- `useEffect` runs code **after** render. Used to save to `localStorage`, to load a record into a form when editing starts, to close the dialog on Escape, and to clear toast timers.
- `useRef` holds a reference to a real input element so the code can call `.focus()` (see `useValidatedField`).

## 10. Event handling, form validation, data flow, and business logic

### Event handling

React events are attached with props: `onChange`, `onBlur`, `onClick`, `onSubmit`. Examples from the project:

- `<input onChange={onChange} onBlur={onBlur} />` in `FormField.jsx`
- `<form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>` in `CategoryForm.jsx`. `preventDefault()` stops the browser from reloading the page.
- `<button onClick={() => onDelete(category)}>` in `CategoryRow.jsx`

Inputs are **controlled**: their `value` comes from state and every keystroke goes through `onChange` to update that state.

### Form validation

`useValidatedField.js` is a hook that every field uses. It keeps `value` and `status` (`null`, `"valid"` or `"invalid"`).

```js
export function useValidatedField(validator = isFilled, initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState(null);
  const ref = useRef(null);

  const validate = useCallback(() => {
    const ok = validator(value);
    setStatus(ok ? "valid" : "invalid");
    return ok;
  }, [value, validator]);
  // ...
}
```

The `validator` argument is the new part. It **defaults to the original midterm rule** (not blank), so category fields behave exactly as before. The transaction form passes different rules:

| Field | Rule | Function |
|---|---|---|
| Category Name, Description | not blank | `isFilled` |
| Transaction category | something selected | `isFilled` |
| Amount | a number greater than 0 and less than 1 trillion | `isValidAmount` |
| Date | not empty | `isFilled` |
| Note | optional, no validation | none |

`handleSave` validates **every** field first (so all errors show at once), then focuses the first invalid one and stops:

```js
const nameOk = name.validate();
const descOk = desc.validate();
if (!nameOk || !descOk) {
  (!nameOk ? name : desc).focus();
  return;
}
```

### Data flow

Data flows **down** as props and events flow **up** as function calls:

```
        state (hooks in App)
              │  props
              ▼
   CategoryTable → CategoryRow
              │  user clicks Delete
              ▼
   onDelete(category)  ──►  App.requestDeleteCategory  ──►  setDialog(...)
                                                              │ user confirms
                                                              ▼
                              deleteCategory(id) + deleteByCategory(id) + notify(...)
```

### Business logic (`src/utils/ledger.js`)

| Function | Rule |
|---|---|
| `isFilled`, `isValidAmount` | Validation rules |
| `sumAmounts` | Adds amounts in **centavos** (integers), then divides by 100, to avoid floating-point errors such as `0.1 + 0.2` |
| `monthTotal` | Total for one `YYYY-MM` month |
| `totalsByCategory`, `topCategory` | Income per category and the highest one |
| `filterCategories`, `filterTransactions` | Case-insensitive search and category filter |
| `sortTransactions` | Newest date first; same-date entries keep newest-added first |
| `formatCurrency`, `formatDate` | Display as Philippine pesos (`Intl.NumberFormat("en-PH", { currency: "PHP" })`) and `Oct 5, 2026` |

## 11. Feature-by-feature walkthrough of important files

### `src/main.jsx`
Entry point. `createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>)` starts React. It imports Bootstrap's CSS and `style.css`. `StrictMode` renders components twice in development to expose bugs; it has no effect in production.

### `src/App.jsx`
The coordinator. It calls the three data hooks, keeps the "currently editing" ids and the `dialog`, calculates derived values, and passes everything down.

```js
// Derived data: calculated from state on every render, never stored separately.
const totals = totalsByCategory(transactions);
const counts = {};
for (const t of transactions) counts[t.categoryId] = (counts[t.categoryId] ?? 0) + 1;
```

Deleting a category is a good example of coordination between two hooks:

```js
onConfirm: () => {
  deleteCategory(category.id);
  deleteByCategory(category.id);       // cascade
  if (editingCategoryId === category.id) setEditingCategoryId(null);
  if (editingTransaction?.categoryId === category.id) setEditingTransactionId(null);
  notify(`Category "${category.name}" deleted.`, "danger");
},
```

### `src/hooks/useLocalStorage.js`
Saves state in the browser so it survives a refresh.

```js
const [value, setValue] = useState(() => {
  try {
    const saved = window.localStorage.getItem(key);
    if (saved === null) return initialValue;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : initialValue;
  } catch {
    return initialValue;
  }
});

useEffect(() => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage full or disabled */ }
}, [key, value]);
```

- Passing a **function** to `useState` means it runs only on the first render.
- `try/catch` plus `Array.isArray` means broken or wrong-shaped saved data is ignored instead of crashing the app. A test covers this.
- Keys: `incomeLedger.categories` and `incomeLedger.transactions`.

### `src/hooks/useTransactions.js`
Same pattern as `useCategories`, with `addTransaction`, `updateTransaction`, `deleteTransaction`, `deleteByCategory` and `deleteAllTransactions`. A transaction looks like:

```js
{ id, categoryId, amount, date: "2026-10-28", note }
```

### `src/components/FormField.jsx`
One reusable labelled field. It renders an `<input>` by default (as in the midterm) or a `<select>` when an `options` array is passed. It adds `is-valid` / `is-invalid` from `status`. `forwardRef` lets the parent hold a ref to the real input so it can focus it. Extra props (`type="number"`, `min`, `step`, `disabled`) are passed to the control through `...rest`.

### `src/components/CategoryForm.jsx`
Handles both **add** and **edit**. If `editingCategory` is given, the form shows "Edit Income Category" and calls `onUpdate`; otherwise it calls `onAdd`. A `useEffect` keyed on `editingCategory?.id` fills the fields when edit starts and clears them when it ends.

### `src/components/TransactionForm.jsx`
Uses three `useValidatedField` hooks (category, amount, date). The date starts as today (`todayISO()`). After a successful add it clears amount and note but **keeps category and date** so several entries can be typed quickly. The form is disabled, with an explanatory message, until at least one category exists. The amount is rounded to 2 decimals before saving: `Math.round(Number(amount.value) * 100) / 100`.

### `src/components/CategoryTable.jsx` / `TransactionTable.jsx`
Receive data as props and render rows. They choose between three views: no data (`EmptyRow` with the original message), no search match (`EmptyRow` with "No categories match your search."), or the rows. `TransactionTable` also shows a footer with the total of the **visible** rows and labels it "Filtered total" when a filter is active.

### `src/components/SummaryCards.jsx`
Four cards computed from the props only: total income, this month's income, transaction count, and top category. "This month" uses the browser's local date.

### `src/components/ConfirmDialog.jsx`
A Bootstrap-styled modal controlled by React state (`dialog` in `App`), so no Bootstrap JavaScript is needed. Cancel gets focus first, Escape closes it, clicking the backdrop closes it, and it has `role="dialog"` and `aria-modal` for accessibility.

### `src/components/ToastContainer.jsx` + `src/hooks/useToasts.js`
`notify(message, variant)` adds a toast to state and starts a 3.5 second timer that removes it. The container has `aria-live="polite"` so screen readers announce messages.

### `src/utils/ledger.js`
All rules and calculations, with no React in it. See the table in Section 10.

### `src/test/`
`ledger.test.js` tests the pure functions. `App.test.jsx` renders the whole `<App />` and simulates a user typing and clicking, which tests the components, hooks and state together.

## 12. AI Assistance Disclosure and My Contribution

I developed this improved version of my **Midterm Income Ledger** with **Claude as my AI assistant**. I used AI assistance to help extend the existing project, improve its user interface, organize the React components, implement additional features, write automated tests, and prepare the documentation.

My role was to guide the development process, define the project requirements, preserve the original midterm features, review the proposed changes, and use the improved application as a learning project. Claude assisted with implementation based on my instructions.

### My Contributions as the Student

| Area | My Contribution |
|---|---|
| Project planning | Defined the goal of improving my existing Midterm Income Ledger instead of rebuilding it from scratch. |
| Requirements | Identified the original features that needed to be retained and the additional features needed to make the application a functional income tracker. |
| Feature direction | Established the requirements for income transactions, summary cards, editing, searching, filtering, and browser-based data persistence. |
| UI/UX direction | Guided the improvements to the layout, form presentation, tables, notifications, confirmation dialogs, and responsive design. |
| Preservation of existing functionality | Required the original category registration, validation rules, Bootstrap styling, and category management features to remain functional. |
| AI-assisted implementation | Used Claude as my assistant to implement and improve the React components, custom hooks, business logic, styling, and automated tests. |
| Testing and verification | Used the documented test results to assess whether the implemented features and original behaviors passed the automated checks. |
| Documentation and code defense | Prepared this README with AI assistance to explain the architecture, features, state management, validation, and important implementation decisions. |

### What Claude Assisted With

| Area | AI-Assisted Work |
|---|---|
| New components | `TransactionForm.jsx`, `TransactionTable.jsx`, `TransactionRow.jsx`, `SummaryCards.jsx`, `ConfirmDialog.jsx`, and `ToastContainer.jsx`. |
| Custom hooks and business logic | `useTransactions.js`, `useLocalStorage.js`, `useToasts.js`, and `utils/ledger.js`. |
| Existing components and hooks | Modifications to `App.jsx`, `CategoryForm.jsx`, `CategoryTable.jsx`, `CategoryRow.jsx`, `EmptyRow.jsx`, `FormField.jsx`, `useCategories.js`, and `useValidatedField.js`. |
| Styling and configuration | Additions to `style.css` and changes to the relevant Vite and package configuration files. |
| Automated testing | Creation and refinement of `ledger.test.js` and `App.test.jsx`. |
| Documentation | Preparation of this README, including setup instructions, feature explanations, and possible instructor questions. |

### How I Used AI Assistance

Claude served as my implementation assistant, helping translate my requirements into React code and suggesting ways to structure and test the application. I directed the intended functionality and used the resulting implementation and documentation to understand how the project works.

I recognize that using AI assistance does not replace my responsibility to understand the code, verify the application's behavior, and explain my implementation decisions during a project demonstration or code defense.

**Disclosure:** This project was developed with AI assistance from Claude. The new features, modifications to existing files, automated tests, and documentation were produced with AI assistance. My contribution was directing the project requirements and improvements, guiding the development, and reviewing the resulting work. This statement describes the intended division of work; I should adjust it if my actual contributions differed.

---

## 13. Code Defense: Likely Instructor Questions

**Q1. Why React instead of plain JavaScript?**
In plain JavaScript I would create and remove table rows with DOM commands and keep the page and the data in sync by hand. In React I only change the data (state) and describe how the UI looks for that data; React updates the page. This removes a whole class of bugs where the list and the screen disagree.

**Q2. What is state, and why not use a normal variable?**
State is data React remembers between renders. Changing a normal variable does not tell React to redraw, so the screen would not change. Calling a state setter (`setCategories`) does.

**Q3. Why do you write `setCategories((prev) => [...prev, category])` instead of `categories.push(category)`?**
React compares the old and new state to decide whether to re-render. `push` changes the same array, so React cannot tell it changed. The spread syntax `[...prev, category]` makes a new array. Using `prev` also makes sure I add to the latest state even if several updates happen close together.

**Q4. What is a custom hook and why did you write several?**
A custom hook is a function starting with `use` that calls other hooks. `useValidatedField` bundles the value, validation status and ref of a field, so I can reuse it for every field instead of copying the same code. `useCategories` and `useTransactions` keep data operations out of the components.

**Q5. How does validation work?**
Each field uses `useValidatedField`. It validates on blur and when saving. Once a field is invalid it re-checks while typing so the red style disappears as soon as the problem is fixed. On save, all fields are validated, the first invalid field is focused, and nothing is saved. Rules are plain functions in `ledger.js`.

**Q6. Why is the amount stored as a number but added in centavos?**
JavaScript uses binary floating point, so `0.1 + 0.2` gives `0.30000000000000004`. `sumAmounts` converts each amount to whole centavos (`Math.round(amount * 100)`), adds integers, then divides by 100. A unit test checks that `1000.10 + 2000.20 + 50` equals `3050.30`.

**Q7. What does "lifting state up" mean here?**
The category list is needed by the form, the table, the summary cards and the transaction dropdown. So it lives in their closest common parent, `App`, which passes it down as props. Search text is needed only by `CategoryTable`, so it stays inside that component.

**Q8. Why do you not store totals in state?**
Totals can always be calculated from the transactions. If I stored them separately I would have to update them everywhere and they could become wrong. Calculating on each render (`totalsByCategory(transactions)`) keeps one source of truth. For this small data size the cost is negligible.

**Q9. How does data survive a refresh?**
`useLocalStorage` loads the saved JSON when the component first renders and saves the state again in a `useEffect` after each change. If the saved data is missing, invalid JSON, or not an array, it starts empty. The data is saved only in that browser on that device.

**Q10. What is `useEffect` used for?**
For work that must happen **after** React has drawn the screen: saving to `localStorage`, loading a record into a form when editing starts, listening for the Escape key, and clearing timers. The dependency array controls when it re-runs, for example `[key, value]` in `useLocalStorage`.

**Q11. What is a controlled input?**
An input whose `value` is set from state and whose `onChange` updates that state. React is the single source of truth for what is in the box, which is what makes validation, resetting and editing simple.

**Q12. Why does each list item have `key={c.id}`?**
React uses `key` to match each item to its previous version when the list changes, so deleting one row does not confuse the others. Ids come from `crypto.randomUUID()`, not the array index, because indexes change when items are deleted.

**Q13. What happens to transactions when I delete a category?**
They are deleted too (cascade). Every transaction has a `categoryId`; leaving them would create income that belongs to nothing. The confirmation dialog says how many will be removed. This rule is new; the midterm had no transactions.

**Q14. How does editing work?**
Clicking Edit sets `editingCategoryId` (or `editingTransactionId`) in `App`. `App` finds the matching record and passes it to the form as `editingCategory`. The form's `useEffect` sees the id change and fills its fields. Saving calls `onUpdate` instead of `onAdd`, then `App` clears the editing id and the form resets.

**Q15. Why `e.preventDefault()` in the form?**
A form's default action reloads the page. Calling `preventDefault()` stops that so React can handle the submit. The forms also use `noValidate` so my own validation messages show instead of the browser's pop-ups.

**Q16. Why is `bootstrap` used but not Bootstrap's JavaScript?**
Only the CSS is needed. The modal and toasts are controlled by React state, which is simpler to explain and avoids two systems fighting over the same DOM elements.

**Q17. What did you test and how?**
38 automated tests run with Vitest: 13 unit tests for the rules in `ledger.js`, and 25 tests that render `<App />` and act like a user (typing, clicking, confirming dialogs, "refreshing" by unmounting and re-rendering). Section 16 lists what passed and what was not tested.

**Q18. What would you do if a test fails?**
Read the failure message, decide whether the test or the code is wrong, fix that, and rerun. During development one test failed because two elements had the same text; the app was correct, so I changed the test to select the table cell specifically.

**Q19. What is the difference between `npm run dev` and `npm run build`?**
`dev` runs a development server with fast reload and unminified code. `build` creates optimized static files in `dist/` for deployment. `preview` serves `dist/` locally so I can check the production version.

**Q20. How is the data secure or private?**
There is no server or account. Data stays in the browser's `localStorage`. This also means it is not encrypted, is not shared between devices, and is lost if the browser data is cleared. It should not be used for sensitive financial records.

**Q21. Which parts did AI write?**
See Section 12. I should answer honestly: the new features, the modifications to the original files, the tests and this README were produced by Claude at my request, and I reviewed them so I can explain them.

## 14. Limitations, assumptions, and future improvements

**Assumptions**

- Currency is Philippine pesos (PHP). To change it, edit the `Intl.NumberFormat` options in `utils/ledger.js` and the "Amount (PHP)" label in `TransactionForm.jsx`.
- "This month" uses the date and time zone of the user's device.
- The app is for one user on one browser.

**Limitations**

- Data is stored only in `localStorage` (no sync, no backup, no encryption, roughly 5 MB browser limit).
- Duplicate category names are allowed, as in the midterm. Two categories called "Consulting" would look the same in the dropdown.
- Deleting a category deletes its transactions (by design, with confirmation).
- Tests run in jsdom, not a real browser, so layout and visual appearance were not verified automatically.
- Amounts are capped below 1 trillion and rounded to 2 decimals.
- No undo for deletes.

**Future improvements**

- Export/import as CSV or JSON for backup.
- Charts (income per month or category).
- Date-range filter and sorting by column.
- Block duplicate category names (a business-rule decision to make deliberately).
- Real-browser end-to-end tests (e.g. Playwright).
- Optional backend and login if multi-device use is needed.

## 15. GitHub publication and Vercel deployment

> This project has **not** been pushed to GitHub or deployed. These steps need my own accounts. Replace `<your-username>` and `<repo-name>` with real values.

### A. Check locally first

```bash
npm install
npm test
npm run build
npm run preview
```

### B. Publish to a public GitHub repository

**Option 1: GitHub website + command line**

1. Sign in to https://github.com and click **New repository**.
2. Enter a name such as `income-ledger`, choose **Public**, and do **not** add a README, .gitignore or license (the project already has them). Click **Create repository**.
3. In the project folder run:

```bash
git init
git add .
git commit -m "Initial commit: Income Ledger React app"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

If you use SSH instead of HTTPS, use the SSH URL GitHub shows on the new repository page.

**Option 2: GitHub CLI (if installed and logged in with `gh auth login`)**

```bash
git init
git add .
git commit -m "Initial commit: Income Ledger React app"
git branch -M main
gh repo create <repo-name> --public --source=. --remote=origin --push
```

Check that `node_modules/` and `dist/` do **not** appear in the repository. `.gitignore` excludes them.

### C. Deploy on Vercel

**Option 1: Vercel dashboard (recommended)**

1. Sign in at https://vercel.com (you can use "Continue with GitHub").
2. Click **Add New... > Project**, and import the GitHub repository. Allow Vercel access to it if asked.
3. Vercel detects **Vite** automatically. Confirm these settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Click **Deploy**. When it finishes, Vercel shows the live URL. Every later `git push` to `main` redeploys automatically.

**Option 2: Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel          # preview deployment
vercel --prod   # production deployment
```

No `vercel.json` is needed. This is a single-page app with no client-side routes, so no rewrite rules are required.

## 16. Testing and verification report

Results from the environment where this project was built (Node 22.22.2, npm 10.9.7, Linux):

| Check | Result |
|---|---|
| `npm install` | Completed |
| `npm test` | **38 of 38 tests passed** (2 files: 13 unit + 25 interface tests) |
| `npm run build` | Succeeded (49 modules; JS about 163 kB, 52 kB gzipped; CSS about 233 kB, 31 kB gzipped) |
| `npm run preview` + HTTP request | The server returned HTTP 200 for the page, the JS bundle and the CSS bundle |

Tests cover: empty states; blank and whitespace validation; focus on the first invalid field; validation on blur and while typing; trimming; form reset and refocus; Enter-key submit; add, edit, cancel, delete, confirm, cancel-confirm, Escape and Delete All for categories; transaction validation, add, edit, delete and Delete All; totals and summary cards; category search; transaction category filter, note search and filtered total; cascade delete; renaming a category; `localStorage` save, reload and corrupted-data fallback.

**Not verified (limitations):**

- **No real-browser testing.** Tests run in jsdom. Visual layout, responsive breakpoints and the look of the pages were not viewed in Chrome, Firefox, Safari or on a phone.
- **No deployment testing.** The Vercel build was not run on Vercel. The project uses the standard Vite setup that Vercel supports, and `npm run build` works locally, but the live deployment is unverified.
- `npm audit` reports 6 vulnerabilities (3 moderate, 1 high, 2 critical), all in development tooling (Vite 5 dev server and Vitest packages). `npm audit --omit=dev` reports none for the packages shipped to users. They were not changed, because the fixes require major-version upgrades that were not tested here.
