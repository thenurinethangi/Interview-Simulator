import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getUserIdFromCookies } from '@/lib/auth';
import InterviewFlow from "@/components/InterviewFlow";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: PageProps) {
    const unresolvedParams = await params;
    const { id } = unresolvedParams;

    const userId = await getUserIdFromCookies();
    if (!userId) {
        redirect(`/auth/login?redirect=/session/${id}`);
    }

    const session = await db.session.findFirst({
        where: { id, userId },
        include: {
            questions: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!session || session.questions.length === 0) {
        return notFound();
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-(--paper) overflow-hidden">
            <InterviewFlow
                sessionId={session.id}
                topic={session.input}
                mode={session.mode}
                initialQuestions={session.questions}
            />
        </div>
    );
}
