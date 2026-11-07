-- ============================================================================
-- Researcher BD — Row Level Security (RLS) Policies for Supabase
-- ============================================================================
--
-- PURPOSE:
--   Defense-in-depth. Our Next.js API routes use Prisma connected via the
--   service-role connection string, which BYPASSES RLS — so all application
--   logic continues to work normally. These policies only protect against
--   DIRECT access using the anon/publishable key (e.g., if someone tried to
--   query Supabase from a browser bypassing our API).
--
-- STRATEGY:
--   - Public-read on discovery tables (opportunities, journals, datasets, etc.)
--   - Self-read on private user data (profile, notifications, bookmarks)
--   - Self-write on own records (profile, bookmarks, notifications.isRead)
--   - No direct writes from anon key (writes go through our API only)
--
-- HOW TO APPLY:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this file
--   3. Click "Run"
--
-- After applying, verify in Database → Tables → each table shows "RLS Enabled"
-- ============================================================================

-- Enable RLS on every table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Publication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PublicationAuthor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PublicationClaim" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contribution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dataset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DatasetAuthor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Opportunity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FundingCall" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Journal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AcademicEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bookmark" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedSearch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Laboratory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LaboratoryMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CollaborationPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CollaborationRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MentorPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LearningCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LearningPath" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LessonProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LearningBookmark" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscussionCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Question" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Answer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResearchProject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectMilestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectResource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSetting" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PUBLIC READ on discovery tables (anyone can browse, anon or authenticated)
-- ============================================================================
-- Note: We expose only the public-safe columns. Sensitive columns like
-- User.passwordHash, User.email, etc. are not in these tables.

CREATE POLICY "public_read_opportunities"        ON "Opportunity"        FOR SELECT USING (true);
CREATE POLICY "public_read_funding_calls"        ON "FundingCall"        FOR SELECT USING (true);
CREATE POLICY "public_read_journals"             ON "Journal"            FOR SELECT USING (true);
CREATE POLICY "public_read_conferences"          ON "Conference"         FOR SELECT USING (true);
CREATE POLICY "public_read_events"               ON "AcademicEvent"      FOR SELECT USING (true);
CREATE POLICY "public_read_datasets"             ON "Dataset"            FOR SELECT USING (true);
CREATE POLICY "public_read_dataset_authors"      ON "DatasetAuthor"      FOR SELECT USING (true);
CREATE POLICY "public_read_organizations"        ON "Organization"       FOR SELECT USING (true);
CREATE POLICY "public_read_org_members"          ON "OrganizationMember" FOR SELECT USING (true);
CREATE POLICY "public_read_laboratories"         ON "Laboratory"         FOR SELECT USING (true);
CREATE POLICY "public_read_lab_members"          ON "LaboratoryMember"   FOR SELECT USING (true);
CREATE POLICY "public_read_collab_posts"         ON "CollaborationPost"  FOR SELECT USING (true);
CREATE POLICY "public_read_collab_requests"      ON "CollaborationRequest" FOR SELECT USING (true);
CREATE POLICY "public_read_mentor_prefs"         ON "MentorPreference"   FOR SELECT USING (true);
CREATE POLICY "public_read_learning_categories"  ON "LearningCategory"  FOR SELECT USING (true);
CREATE POLICY "public_read_learning_paths"       ON "LearningPath"       FOR SELECT USING (true);
CREATE POLICY "public_read_lessons"              ON "Lesson"             FOR SELECT USING (true);
CREATE POLICY "public_read_discussion_categories" ON "DiscussionCategory" FOR SELECT USING (true);
CREATE POLICY "public_read_questions"            ON "Question"           FOR SELECT USING (true);
CREATE POLICY "public_read_answers"              ON "Answer"             FOR SELECT USING (true);
CREATE POLICY "public_read_comments"             ON "Comment"            FOR SELECT USING (true);
CREATE POLICY "public_read_votes"                ON "Vote"               FOR SELECT USING (true);
CREATE POLICY "public_read_publications"         ON "Publication"        FOR SELECT USING (true);
CREATE POLICY "public_read_publication_authors"  ON "PublicationAuthor" FOR SELECT USING (true);
CREATE POLICY "public_read_public_projects"      ON "ResearchProject"    FOR SELECT USING ("isPrivate" = false);
CREATE POLICY "public_read_project_milestones_public" ON "ProjectMilestone" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "ResearchProject" WHERE "ResearchProject"."id" = "ProjectMilestone"."projectId" AND "ResearchProject"."isPrivate" = false)
);

-- ============================================================================
-- USER self-read on private data
-- ============================================================================

-- A user can read their own User row (but only via the API which uses service role).
-- Direct anon access to User table is BLOCKED entirely — too sensitive.
-- (No SELECT policy on User → defaults to deny when RLS is enabled.)

-- Profile: only the owner can read their own profile via direct access.
-- Public profile browsing goes through our API which checks isPublic flag.
CREATE POLICY "self_read_profile" ON "Profile" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "self_update_profile" ON "Profile" FOR UPDATE USING (auth.uid() = "userId");

-- Bookmarks: only owner can see their bookmarks
CREATE POLICY "self_read_bookmarks" ON "Bookmark" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "self_insert_bookmarks" ON "Bookmark" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "self_delete_bookmarks" ON "Bookmark" FOR DELETE USING (auth.uid() = "userId");

-- Saved searches: only owner
CREATE POLICY "self_read_saved_searches" ON "SavedSearch" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "self_insert_saved_searches" ON "SavedSearch" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "self_delete_saved_searches" ON "SavedSearch" FOR DELETE USING (auth.uid() = "userId");

-- Notifications: only owner can read and mark as read
CREATE POLICY "self_read_notifications" ON "Notification" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "self_update_notifications" ON "Notification" FOR UPDATE USING (auth.uid() = "userId");

-- Lesson progress: only owner
CREATE POLICY "self_read_lesson_progress" ON "LessonProgress" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "self_upsert_lesson_progress" ON "LessonProgress" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "self_update_lesson_progress" ON "LessonProgress" FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "self_delete_lesson_progress" ON "LessonProgress" FOR DELETE USING (auth.uid() = "userId");

-- Learning bookmarks: only owner
CREATE POLICY "self_read_learning_bookmarks" ON "LearningBookmark" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "self_insert_learning_bookmarks" ON "LearningBookmark" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "self_delete_learning_bookmarks" ON "LearningBookmark" FOR DELETE USING (auth.uid() = "userId");

-- Publication claims: only owner can see their claims
CREATE POLICY "self_read_publication_claims" ON "PublicationClaim" FOR SELECT USING (auth.uid() = "userId");

-- Contributions: only owner can see their private contributions
CREATE POLICY "self_read_contributions" ON "Contribution" FOR SELECT USING (auth.uid() = "userId");

-- Vote: a user can read their own votes
CREATE POLICY "self_read_votes" ON "Vote" FOR SELECT USING (auth.uid() = "userId");

-- ============================================================================
-- PROJECT access control — members can read their own projects (incl. private)
-- ============================================================================

-- Project members can SELECT projects they belong to (covers private ones).
-- Public projects are already covered by the public_read policy above.
CREATE POLICY "member_read_projects" ON "ResearchProject" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "ProjectMember" WHERE "ProjectMember"."projectId" = "ResearchProject"."id" AND "ProjectMember"."userId" = auth.uid())
);

-- Project members can read tasks, resources, notes of their projects
CREATE POLICY "member_read_project_tasks" ON "ProjectTask" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "ProjectMember" WHERE "ProjectMember"."projectId" = "ProjectTask"."projectId" AND "ProjectMember"."userId" = auth.uid())
);
CREATE POLICY "member_read_project_resources" ON "ProjectResource" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "ProjectMember" WHERE "ProjectMember"."projectId" = "ProjectResource"."projectId" AND "ProjectMember"."userId" = auth.uid())
);
CREATE POLICY "member_read_project_notes" ON "ProjectNote" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "ProjectMember" WHERE "ProjectMember"."projectId" = "ProjectNote"."projectId" AND "ProjectMember"."userId" = auth.uid())
);
CREATE POLICY "member_read_project_milestones" ON "ProjectMilestone" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "ProjectMember" WHERE "ProjectMember"."projectId" = "ProjectMilestone"."projectId" AND "ProjectMember"."userId" = auth.uid())
);
CREATE POLICY "member_read_project_members" ON "ProjectMember" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "ProjectMember" pm WHERE pm."projectId" = "ProjectMember"."projectId" AND pm."userId" = auth.uid())
);

-- ============================================================================
-- QUESTIONS, ANSWERS, COMMENTS — authored content
-- ============================================================================

CREATE POLICY "self_update_questions" ON "Question" FOR UPDATE USING (auth.uid() = "authorId");
CREATE POLICY "self_delete_questions" ON "Question" FOR DELETE USING (auth.uid() = "authorId");

CREATE POLICY "self_update_answers"   ON "Answer"   FOR UPDATE USING (auth.uid() = "authorId");
CREATE POLICY "self_delete_answers"   ON "Answer"   FOR DELETE USING (auth.uid() = "authorId");

CREATE POLICY "self_delete_comments"  ON "Comment"  FOR DELETE USING (auth.uid() = "authorId");

CREATE POLICY "self_insert_votes"     ON "Vote"     FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "self_delete_votes"     ON "Vote"     FOR DELETE USING (auth.uid() = "userId");

-- ============================================================================
-- COLLABORATION — post owners manage their posts and requests
-- ============================================================================

CREATE POLICY "self_update_collab_posts"    ON "CollaborationPost"    FOR UPDATE USING (auth.uid() = "authorId");
CREATE POLICY "self_delete_collab_posts"    ON "CollaborationPost"    FOR DELETE USING (auth.uid() = "authorId");
CREATE POLICY "self_insert_collab_requests" ON "CollaborationRequest" FOR INSERT WITH CHECK (auth.uid() = "userId");

-- ============================================================================
-- SENSITIVE TABLES — no direct anon access at all
-- (All access goes through our API routes using the service role)
-- ============================================================================
-- User: no policy = deny all direct access
-- Submission: no policy = deny all direct access
-- Report: no policy = deny all direct access (reporter can read their own via API)
-- AuditLog: no policy = deny all direct access
-- SystemSetting: no policy = deny all direct access

-- Optional: allow reporters to see the status of their own reports
CREATE POLICY "self_read_reports" ON "Report" FOR SELECT USING (auth.uid() = "reporterId");

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this, verify with:
--   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- Every table should show rowsecurity = true.

-- To list all policies:
--   SELECT tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public';
