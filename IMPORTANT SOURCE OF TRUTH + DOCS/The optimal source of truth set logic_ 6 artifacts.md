## **The optimal set: 6 artifacts**

### **1\) PRD-lite (1–3 pages)**

**Purpose:** what/why/who \+ *hard scope*.  
 Must include: goals, target user, core loop, **No-list**, success criteria.

### **2\) State & Flow Map (1 page)**

**Purpose:** “how the product behaves” at a glance.  
 Must include: auth states \+ trial/premium states \+ major flows (create project → pillars → recap → export).

This can be a single diagram or a bullet “state machine” page.

### **3\) Contract Spec (repo Markdown)**

**Purpose:** the enforceable truth for dev.  
 Must include: data entities, invariants, API endpoints, error codes \+ meanings, retry rules, quotas/rate-limit, “when trial is consumed”.

### **4\) Acceptance Tests (GWT list)**

**Purpose:** anti-ambiguity \+ anti-regression.  
 Must include: 20–50 short scenarios covering your risky rules (trial, no-fallback, AI failure handling, export conditions, quota, permission errors).  
 *(This can live inside the Contract Spec as a section, but it deserves its own heading and discipline.)*

### **5\) Figma (Visual Truth)**

**Purpose:** exact UI states and microcopy.  
 Must include: tokens/components \+ every key screen state (loading/empty/error/disabled) mapped to contract codes (e.g., ERR\_409).

### **6\) Decision Log / Changelog (ADR-lite)**

**Purpose:** stop “we changed it but forgot where.”  
 Every time you change a canon rule, you add a 2–5 line entry: decision, why, impacted artifacts.

---

## **Optional (add only if you feel pain)**

### **7\) Dev Runbook (only if setup is non-trivial)**

Supastarter conventions, env vars, deployment steps, how to run locally, where prompts/config live.

### **8\) Prompt Pack**

Only if prompts are complex and you want versioning. Otherwise keep prompts close to code.

---

## **A simple rule that keeps this from exploding again**

**One fact lives in one place.**

* Business rule / edge-case → **Contract \+ Acceptance**

* UX rendering of that rule → **Figma** (references the contract rule ID)

* Why it exists / what you’re not doing → **PRD-lite \+ No-list**

If you follow that, you can have 6–8 artifacts without bloat.

