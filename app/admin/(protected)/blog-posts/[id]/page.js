import { notFound } from "next/navigation";
import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../../lib/db";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import BlogPostForm from "../BlogPostForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeBlogPost(post) {
  if (!post) return null;
  return {
    ...post,
    publishedAt: post.publishedAt?.toISOString?.() ?? post.publishedAt,
    createdAt: post.createdAt?.toISOString?.() ?? post.createdAt,
    updatedAt: post.updatedAt?.toISOString?.() ?? post.updatedAt,
  };
}

export default async function EditBlogPostPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const { id } = await params;

  const [post, categories] = await prisma.$transaction([
    prisma.blogPost.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.blogCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  if (!post) notFound();

  return <BlogPostForm mode="edit" post={serializeBlogPost(post)} categories={categories} canManage={canManage} />;
}
