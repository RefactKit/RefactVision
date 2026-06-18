# RefactVision

[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=RefactKit_RefactVision)](https://sonarcloud.io/summary/new_code?id=RefactKit_RefactVision)
![License](https://img.shields.io/badge/license-Open%20Source-16a34a?style=flat-square)
![Computer Vision](https://img.shields.io/badge/domain-Computer%20Vision-2563eb?style=flat-square)
![Multi-Tenant](https://img.shields.io/badge/architecture-Multi--Tenant-f59e0b?style=flat-square)
![Collaboration](https://img.shields.io/badge/workflow-Collaborative-7c3aed?style=flat-square)
![Interoperability](https://img.shields.io/badge/export-Roboflow%20%7C%20Ultralytics-0f766e?style=flat-square)

> **RefactVision** is an open-source, collaborative data labeling platform for computer vision teams. It helps organizations annotate, review, govern, and export image datasets across secure workspaces while staying interoperable with downstream training stacks such as Ultralytics and Roboflow.

RefactVision is built for teams that want more than a basic annotation tool. It combines collaborative labeling, role-based review workflows, multi-tenant workspace isolation, and privacy-first data ownership in one product so datasets can move from raw images to production-ready exports with less friction.

---

## Table of Contents

- [Why RefactVision](#why-refactvision)
- [Core Capabilities](#core-capabilities)
- [Who It Is For](#who-it-is-for)
- [How It Works](#how-it-works)
- [Workspace Model](#workspace-model)
- [Annotation Workflow](#annotation-workflow)
- [Exports and Interoperability](#exports-and-interoperability)
- [Product Principles](#product-principles)
- [Feature Overview](#feature-overview)
- [Use Cases](#use-cases)
- [Architecture Highlights](#architecture-highlights)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [Open Source](#open-source)
- [Built With](#built-with)

---

## Why RefactVision

Most computer vision workflows are fragmented. Teams often use one tool for annotation, another for review, another for training, and then custom scripts for export, which creates unnecessary complexity around permissions, dataset quality, and reproducibility.

RefactVision is built to bridge this gap. It provides an intuitive interface so that **non-ML domain experts** (like agronomists, doctors, or factory inspectors) can easily label datasets using custom categories they define themselves, without needing machine learning expertise.

Key advantages include:
- **Flexible Workflows**: Large datasets can be annotated in stages. Annotators can pause their work and easily finish labeling later, knowing all progress is securely saved.
- **Seamless Handoff**: Once labeling and review are complete, datasets can be exported instantly to platforms like **Ultralytics** or **Roboflow** for model training.
- **Privacy & Governance**: Instead of locking your dataset lifecycle into an external vendor, RefactVision keeps annotation and review under your control, offering complete tenant isolation.

---

## Core Capabilities

### Collaborative labeling

- Annotate images across shared datasets.
- Support team-based workflows with ownership, assignment, and review.
- Improve labeling quality with structured QA before export.

### Multi-tenant workspaces

- Isolate organizations, teams, datasets, and users by workspace.
- Support B2B, agency, and multi-client setups safely.
- Keep each tenant's data, permissions, and activity separated by design.

### Review and governance

- Create reviewer flows before a dataset is marked ready.
- Track annotation status, approval, rejection, and relabel requests.
- Add audit visibility for team actions and workspace activity.

### Export interoperability

- Export datasets into YOLO-oriented pipelines.
- Connect annotated datasets to Roboflow-style or Ultralytics-style downstream workflows.
- Avoid vendor lock-in by keeping labeling independent from model training.

### Privacy-first operations

- Keep sensitive datasets under organizational control.
- Support self-hosted and developer-controlled workflows.
- Reduce dependence on closed platforms for the most sensitive stage of the data pipeline.

---

## Who It Is For

RefactVision is designed for:

- **Non-ML domain experts** who need to define custom labeling categories and annotate data easily without deep technical or computer vision expertise.
- **Computer vision startups** building detection, classification, or inspection products.
- **ML teams** that need collaborative image annotation, pause-and-resume workflows, and structured review processes.
- **Agencies** serving multiple clients with strict workspace isolation requirements.
- **Research and product teams** that want an open-source labeling layer before training.
- **Founders** building vertical AI products in agriculture, retail, logistics, industrial QA, and similar image-heavy domains.

---

## How It Works

1. Create an organization or workspace.
2. Invite annotators, reviewers, and admins.
3. Upload images and define classes.
4. Create annotation tasks and assign work.
5. Review, approve, or relabel annotations.
6. Export the curated dataset into the target training format.
7. Continue iterating as new images or corrections arrive.

This workflow keeps dataset preparation traceable and collaborative before training begins, which is often the highest-friction part of production computer vision work.

---

## Workspace Model

RefactVision uses an organization-aware model where each workspace acts as a boundary for users, datasets, annotation jobs, exports, and permissions. This is essential for multi-tenant SaaS use cases where multiple customers, departments, or projects must remain isolated.

A workspace can represent a company, a team, a client account, or an internal business unit. Within that workspace, roles define what each member can view, label, review, export, or administer.

### Typical roles

- **Owner** — manages workspace settings, members, billing, and policy.
- **Admin** — manages datasets, classes, assignments, and exports.
- **Reviewer** — validates labels, approves results, and sends work back for fixes.
- **Annotator** — labels assigned data and updates annotations.
- **Viewer** — read-only access for project stakeholders.

---

## Annotation Workflow

RefactVision is centered on practical computer vision dataset operations rather than generic data management.

### Typical workflow features

- Dataset creation and organization.
- Class taxonomy management.
- Image upload and storage.
- Bounding-box labeling workflows.
- Annotation assignment by user or queue.
- Review state transitions such as draft, in-review, approved, and needs-fix.
- Dataset readiness checks before export.

Over time, this workflow can be extended with model-assisted annotation, active learning, and automation, but the main product value starts with reliable collaborative labeling.

---

## Exports and Interoperability

RefactVision is intentionally designed to work well with external computer vision ecosystems instead of replacing them.

### Why this matters

Different teams prefer different training stacks. Some want a managed cloud dataset pipeline, while others want a more direct YOLO-centric training flow. RefactVision keeps the annotation layer neutral, then allows downstream handoff once labels are validated.

### Supported integration direction

- **Ultralytics-oriented export** for YOLO training, benchmarking, and deployment workflows.
- **Roboflow-oriented export or sync** for teams that want managed dataset operations and additional cloud workflow layers.
- **Custom dataset pipelines** for internal ML infrastructure.

This separation is strategic. It lets teams keep ownership of the most sensitive part of the workflow, which is data creation and review, while still using best-in-class tools for training and deployment.

---

## Product Principles

### 1. Collaboration before automation

Good datasets come from strong workflows, not just smart models. RefactVision prioritizes team coordination, review, and clear responsibilities before layering on automation.

### 2. Privacy before convenience

Many teams can use third-party services, but not every team wants to trust sensitive datasets to a closed external workflow. RefactVision is designed for teams that value control.

### 3. Interoperability over lock-in

The platform should not force users into one model vendor or one export path. The annotation layer must stay portable.

### 4. Multi-tenancy by design

Tenant separation is not an afterthought. It is a core architectural property of the product and a major differentiator for B2B usage.

### 5. Open-source extensibility

Teams should be able to inspect, adapt, extend, and self-host the platform as their workflow evolves.

---

## Feature Overview

| Area | What RefactVision provides |
|---|---|
| Workspaces | Tenant-isolated organizations, members, datasets, permissions |
| Collaboration | Shared annotation queues, assignments, review workflows |
| Governance | RBAC, audit-oriented operations, approval states |
| Annotation | Image labeling workflows for computer vision datasets |
| Export | Interoperability with Ultralytics, Roboflow, and custom pipelines |
| Privacy | Controlled data ownership and self-hosting-friendly model |
| Extensibility | Open-source base for domain-specific CV products |

---

## Use Cases

### Agriculture

Label crop diseases, pests, fruit conditions, or field imagery for mobile or edge detection systems. This fits especially well with YOLO-style benchmarking and deployment workflows.

### Retail and shelf intelligence

Build datasets for product detection, shelf compliance, and store monitoring workflows.

### Industrial quality control

Label defects, components, and inspection categories across factories or client-specific workspaces.

### Logistics and warehousing

Annotate boxes, pallets, damaged items, barcodes, or package states for operational computer vision systems.

### Research and internal AI teams

Create a private collaborative annotation layer that feeds internal experimentation and production pipelines.

---

## Architecture Highlights

RefactVision is designed as a modern full-stack web platform with a strong emphasis on secure workspaces, typed server logic, and scalable tenant-aware operations. The implementation foundation uses RefactKit as the underlying SaaS base, which helps provide organizations, RBAC, authentication, and production-ready application infrastructure without redefining the product as a boilerplate showcase.

### Architectural priorities

- Tenant-aware backend boundaries.
- Secure authentication and membership checks.
- Role-based access control for collaboration and review.
- Audit-friendly server-side operations.
- Clean separation between annotation logic and export/integration logic.
- Extensible storage and dataset pipelines.

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL or compatible managed database
- Object storage for image assets
- Environment variables for auth, email, and storage depending on deployment mode

### Local setup

```bash
git clone https://github.com/your-org/refactvision.git
cd refactvision
pnpm install
pnpm dev
```

### Recommended first steps

1. Configure the environment variables.
2. Set up the database.
3. Create a workspace.
4. Invite your team.
5. Upload a sample dataset.
6. Define classes.
7. Start labeling and review.
8. Export the approved dataset.

---

## Roadmap

### Near term

- Richer image annotation UX.
- Better reviewer tools and comments.
- Improved export presets.
- Dataset version snapshots.
- Workspace analytics for throughput and quality.

### Mid term

- Model-assisted pre-labeling.
- Active learning loops.
- API-first ingestion and automation.
- More advanced taxonomy and ontology controls.
- Enterprise storage and compliance options.

### Long term

- Video annotation support.
- Team performance dashboards.
- Dataset lineage and experiment tracking.
- Plug-in ecosystem for custom CV workflows.

---

## Open Source

RefactVision is intended to be open, extensible, and developer-friendly. The goal is to give teams a computer vision labeling platform they can inspect, adapt, and integrate rather than a closed workflow they cannot control.

Open-source matters here because dataset operations are too important to hide behind a black box. Annotation quality, review policy, export logic, and storage choices should remain understandable and adaptable.

---

## Built With

RefactVision is built as a modern full-stack SaaS application and uses RefactKit as its implementation foundation for multi-tenant architecture, authentication, RBAC, and product infrastructure.

That foundation supports the product, but RefactVision should be understood as its own application: a collaborative data labeling platform for computer vision teams.

---

## Positioning Summary

RefactVision is not just a labeling UI. It is the collaborative control layer between raw image data and downstream computer vision training pipelines. Teams use it to annotate together, review systematically, protect sensitive data, and export clean datasets into the tools they already trust for benchmarking and deployment.
