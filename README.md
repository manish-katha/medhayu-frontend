
# OPDO - Ayurvedic Clinic Management & Research Platform

OPDO (AyurClinic Digital Office) is a comprehensive, AI-powered SAAS platform designed to streamline the management of Ayurveda clinics while fostering a collaborative research environment. It is built as a full-stack Next.js application, leveraging MongoDB for the database and Genkit for its AI capabilities.

The platform is conceptually divided into two main integrated modules: **MY CLINIC** and **MEDHAYU**.

## Core Concepts

### MY CLINIC
This is the operational heart of the platform, designed for the day-to-day management of an Ayurvedic clinic. It's a multi-tenant SaaS solution where each doctor or clinic operates within their own secure environment.

*   **Purpose**: Patient management, appointments, billing, inventory, and prescriptions.
*   **Data**: All patient and clinic operational data is kept private and secure to the specific clinic.
*   **Audience**: Primarily for Doctors and their clinic staff (Receptionists, etc.).

### MEDHAYU
This is the collaborative knowledge and research wing of the platform. It's a shared space for all users to engage in scholarly activities, author content, and contribute to a growing body of Ayurvedic knowledge.

*   **Purpose**: Collaborative authoring of classical texts, writing and sharing articles, creating case studies, and engaging in scholarly discussions (Manthana).
*   **Data**: Content is meant for sharing and collaboration. Patient data from "MY CLINIC" can be *anonymously* converted into case studies and shared on MEDHAYU, bridging clinical practice with research.
*   **Audience**: Primarily for Researchers, Scholars, Students, and Doctors looking to contribute to and learn from the community.

## User Roles & Responsibilities

*   **Doctor / Practitioner**: The primary user of the **MY CLINIC** module. They manage patient data, create prescriptions, and handle billing. They can also switch to the **MEDHAYU** module to author articles, participate in discussions, or turn clinical cases into research material.
*   **Researcher / Scholar**: The primary user of the **MEDHAYU** module. Their focus is on authoring books, creating detailed articles and whitepapers, curating the knowledge base, and engaging in scholarly debate.
*   **(Future) Receptionist**: A user role within **MY CLINIC** with limited permissions to manage appointments, patient check-ins, and basic billing.
*   **(Future) Admin**: A super-user role with access to system-wide settings and user management.

## Technical Architecture

*   **Framework**: **Next.js 15+ with App Router**. Used as a full-stack framework. React Server Components and Server Actions are leveraged for performance and data mutations.
*   **Language**: **TypeScript**. For type safety and better developer experience.
*   **Styling**: **Tailwind CSS** with **ShadCN UI** components for a modern, consistent, and customizable design system.
*   **Backend**: **Next.js API Routes** and **Server Actions**. The backend logic resides directly within the Next.js application, creating a unified codebase.
*   **Database**: **MongoDB**. A NoSQL database chosen for its flexibility with complex, nested documents, which is ideal for storing patient records, prescriptions, and scholarly articles.
*   **ORM/ODM**: **Mongoose**. Provides schema validation, middleware, and a more structured way to interact with MongoDB from the application.
*   **AI Integration**: **Google AI (Genkit)**. Powers features like diet and dosage suggestions, text extraction from lab reports, and contextual search within the knowledge base.

## Database Schema Plan (MongoDB with Mongoose)

Our database is structured into several key collections:

1.  **`users`**:
    *   **Purpose**: Stores information for all platform users (Doctors, Researchers, Students).
    *   **Key Fields**: `firstname`, `lastname`, `email` (unique), `phone`, `password` (hashed), `role` (`doctor`, `student`, etc.), professional and educational details.
    *   **Relations**: A user can own multiple `clinics`.

2.  **`patients`**:
    *   **Purpose**: Stores all patient demographic and medical information.
    *   **Key Fields**: `name`, `age`, `gender`, `phone`, `address`, `chiefComplaint`, `medicalHistory`. Each patient is linked to a `clinic` and a `doctor` (user).
    *   **Relations**: Linked to a `clinic` and has many `visits`, `invoices`, `labReports`, and `caseStudies`.

3.  **`clinics`**:
    *   **Purpose**: Represents a physical clinic location. A doctor can have multiple clinics.
    *   **Key Fields**: `clinicName`, `location`, `doctorId`.
    *   **Relations**: Linked to a `user` (owner).

4.  **`books` & Book Content Files**:
    *   **Purpose**: Manages the metadata and content of scholarly books in MEDHAYU.
    *   **`books.json`**: A central file containing metadata for all books (title, author, category, cover images).
    *   **`[bookId].json`**: Individual files for each book containing the full content (`chapters`, `articles`, nested structure). This separation keeps the main book list light while allowing for large, complex book content.

5.  **`discussions`**:
    *   **Purpose**: Stores all questions, answers, and debate threads from MEDHAYU.
    *   **Key Fields**: `title`, `content`, `author`, `answers`, `manthana` (debate threads).

6.  **`inventoryitems`**:
    *   **Purpose**: Manages stock for clinic products and medicines.
    *   **Key Fields**: `name`, `stock`, `purchasePrice`, `salePrice`, `expiryDate`.

7.  **`vendors`**:
    *   **Purpose**: Stores supplier information for procurement.
    *   **Key Fields**: `name`, `contactPerson`, `phone`, `address`, `gstin`.

## Project Setup and Execution

### 1. Environment Variables
Create a `.env` file in the root of the project and add your MongoDB connection string:
```
MONGODB_URI="your_mongodb_connection_string_here"
```

### 2. Install Dependencies
Install all the required packages using npm:
```bash
npm install
```

### 3. Run the Development Server
To start the Next.js development server, run:
```bash
npm run dev
```
The application will be accessible at `http://localhost:9002`.

### 4. Key Dependencies
*   `next`: The core React framework.
*   `react`: UI library.
*   `mongodb`, `mongoose`: For database interaction.
*   `tailwindcss`, `shadcn-ui`, `lucide-react`: For styling and UI components.
*   `zod`: For data validation.
*   `@genkit-ai/googleai`, `@genkit-ai/next`: For AI-powered features.
*   `react-hook-form`, `@hookform/resolvers`: For robust form management.
