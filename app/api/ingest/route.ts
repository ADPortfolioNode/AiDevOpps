import { NextRequest, NextResponse } from 'next/server';
import { processDocument, DocumentLoadError } from '@/lib/documentProcessor';
import { addTimelineEvent } from '@/lib/serverCache';

export const dynamic = 'force-dynamic';

const getAuthSession = async () => {
  return Promise.resolve({ user: { id: 'anonymous-user' } });
};

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await request.formData();
    const document = formData.get('document') as File | null;
    const url = formData.get('url') as string | null;

    if (!document && !url) {
      return NextResponse.json(
        { error: 'Either a document file or a URL must be provided.' },
        { status: 400 },
      );
    }

    addTimelineEvent('Ingest Started', `Processing ${document ? 'file' : 'URL'} ingestion...`);

    if (document) {
      const mimeType = document.type;

      if (!['application/pdf', 'text/plain'].includes(mimeType)) {
        return NextResponse.json(
          { error: 'Only PDF and text files are supported.' },
          { status: 400 },
        );
      }

      try {
        const arrayBuffer = await document.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileForProcessing = new File([buffer], document.name, { type: mimeType });
        await processDocument(fileForProcessing, 'file', mimeType, userId);

        addTimelineEvent('Document Ingested', `Successfully processed: ${document.name}`);
        return NextResponse.json({
          message: `Successfully ingested document: ${document.name}`,
          fileName: document.name,
        });
      } catch (processingError) {
        return handleProcessingError(processingError);
      }
    }

    try {
      new URL(url!);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 });
    }

    try {
      await processDocument(url!, 'url', undefined, userId);
      addTimelineEvent('URL Ingested', `Successfully processed: ${url}`);
      return NextResponse.json({
        message: `Successfully ingested URL: ${url}`,
        url,
      });
    } catch (processingError) {
      return handleProcessingError(processingError);
    }
  } catch (error) {
    console.error('Ingest API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    addTimelineEvent('Error', `Ingest error: ${errorMessage}`);

    const isDevelopment = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { error: isDevelopment ? `Ingest Error: ${errorMessage}` : 'An internal error occurred.' },
      { status: 500 },
    );
  }
}

function handleProcessingError(error: unknown) {
  const errorMsg = error instanceof Error ? error.message : 'Unknown error during processing';
  console.error('Document processing error:', errorMsg);
  addTimelineEvent('Ingest Error', `Failed to process document: ${errorMsg}`);

  if (error instanceof DocumentLoadError || errorMsg.includes('Failed to load')) {
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  return NextResponse.json({ error: `Failed to process document: ${errorMsg}` }, { status: 500 });
}
