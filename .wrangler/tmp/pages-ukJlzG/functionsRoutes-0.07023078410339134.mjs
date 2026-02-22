import { onRequestPut as __api_appointments__id__ts_onRequestPut } from "C:\\Users\\abhis\\Desktop\\hospital management website\\functions\\api\\appointments\\[id].ts"
import { onRequestGet as __api_appointments_ts_onRequestGet } from "C:\\Users\\abhis\\Desktop\\hospital management website\\functions\\api\\appointments.ts"
import { onRequestPost as __api_appointments_ts_onRequestPost } from "C:\\Users\\abhis\\Desktop\\hospital management website\\functions\\api\\appointments.ts"

export const routes = [
    {
      routePath: "/api/appointments/:id",
      mountPath: "/api/appointments",
      method: "PUT",
      middlewares: [],
      modules: [__api_appointments__id__ts_onRequestPut],
    },
  {
      routePath: "/api/appointments",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_appointments_ts_onRequestGet],
    },
  {
      routePath: "/api/appointments",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_appointments_ts_onRequestPost],
    },
  ]