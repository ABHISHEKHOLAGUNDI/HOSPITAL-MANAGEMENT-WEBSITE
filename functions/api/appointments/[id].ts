export async function onRequestPut(context: any) {
    const { request, env } = context;

    try {
        // extract ID from URL (e.g. /api/appointments/[id])
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const appointmentId = pathSegments[pathSegments.length - 1]; // Assume /api/appointments/[id]

        const body = await request.json();
        const { status } = body;

        if (!status) return new Response("Status required", { status: 400 });

        const { success } = await env.DB.prepare(
            `UPDATE appointments SET status = ? WHERE id = ?`
        ).bind(status, appointmentId).run();

        return Response.json({ success });
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}
