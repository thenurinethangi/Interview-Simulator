import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import InterviewFlow from "@/components/InterviewFlow";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: PageProps) {
    const unresolvedParams = await params;
    const { id } = unresolvedParams;

    const session = await db.session.findUnique({
        where: { id },
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
