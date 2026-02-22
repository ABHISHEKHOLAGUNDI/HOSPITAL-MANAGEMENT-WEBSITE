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

        try {
            const result = await env.DB.prepare(
                `INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, serviceId, serviceName, date, time, status, price) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(id, patientId, patientName, doctorId, doctorName, serviceId, serviceName, date, time, status, price).run();

            if (result.success) {
                return Response.json({ success: true, message: "Appointment created" });
            } else {
                return new Response(JSON.stringify({ error: "Failed to insert", details: result }), { status: 500 });
            }
        } catch (dbError: any) {
            return new Response(JSON.stringify({ error: "DB Error", message: dbError.message }), { status: 500 });
        }
    } catch (e: any) {
        return new Response(JSON.stringify({ error: "API Error", message: e.message }), { status: 500 });
    }
}
