export async function onRequestGet(context: any) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare(
            "SELECT * FROM appointments ORDER BY date DESC"
        ).all();
        return Response.json(results);
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}

export async function onRequestPost(context: any) {
    const { request, env } = context;
    try {
        const body = await request.json();
        const { id, patientId, patientName, doctorId, doctorName, serviceId, serviceName, date, time, status, price } = body;

        const { success } = await env.DB.prepare(
            `INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, serviceId, serviceName, date, time, status, price) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(id, patientId, patientName, doctorId, doctorName, serviceId, serviceName, date, time, status, price).run();

        if (success) {
            return Response.json({ success: true, message: "Appointment created" });
        } else {
            return new Response("Failed to insert", { status: 500 });
        }
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}
