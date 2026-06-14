import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'

// ─── FICHAS CIUDAD ─────────────────────────────────────────────────────────

export const useFichasCiudad = () =>
  useQuery({
    queryKey: ['fichas_ciudad'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fichas_ciudad')
        .select('*')
        .order('fecha_llegada')
      if (error) throw error
      return data
    },
    enabled: !!supabase,
  })

export const useFichaCiudad = (ciudad) =>
  useQuery({
    queryKey: ['fichas_ciudad', ciudad],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fichas_ciudad')
        .select('*')
        .eq('ciudad', ciudad)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!supabase && !!ciudad,
  })

// ─── PERSONAS ──────────────────────────────────────────────────────────────

export const usePersonas = (familia = null) =>
  useQuery({
    queryKey: ['personas', familia],
    queryFn: async () => {
      let q = supabase.from('personas').select('*').order('familia').order('nombre')
      if (familia) q = q.eq('familia', familia)
      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: !!supabase,
  })

// ─── VUELOS ────────────────────────────────────────────────────────────────

export const useVuelos = () =>
  useQuery({
    queryKey: ['vuelos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vuelos')
        .select('*')
        .order('fecha')
      if (error) throw error
      return data
    },
    enabled: !!supabase,
  })

// ─── HOTELES ───────────────────────────────────────────────────────────────

export const useHoteles = (ciudad = null, familia = null) =>
  useQuery({
    queryKey: ['hoteles', ciudad, familia],
    queryFn: async () => {
      let q = supabase.from('hoteles').select('*').order('checkin')
      if (ciudad) q = q.eq('ciudad', ciudad)
      if (familia) q = q.eq('familia', familia)
      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: !!supabase,
  })

// ─── PENDIENTES ────────────────────────────────────────────────────────────

export const usePendientes = (categoria = null, ciudad = null) =>
  useQuery({
    queryKey: ['pendientes', categoria, ciudad],
    queryFn: async () => {
      let q = supabase.from('pendientes').select('*').order('prioridad').order('created_at')
      if (categoria) q = q.eq('categoria', categoria)
      if (ciudad)    q = q.eq('ciudad', ciudad)
      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: !!supabase,
  })

export const useUpdatePersona = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { error } = await supabase.from('personas').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personas'] }),
  })
}

export const useAddPendiente = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pendiente) => {
      const { error } = await supabase.from('pendientes').insert(pendiente)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pendientes'] }),
  })
}

export const useTogglePendiente = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, hecho }) => {
      const { error } = await supabase
        .from('pendientes')
        .update({ hecho: !hecho })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pendientes'] }),
  })
}

// ─── LUGARES ───────────────────────────────────────────────────────────────

export const useLugares = (ciudad, categoria = null) =>
  useQuery({
    queryKey: ['lugares', ciudad, categoria],
    queryFn: async () => {
      let q = supabase.from('lugares').select('*').eq('ciudad', ciudad)
      if (categoria) q = q.eq('categoria', categoria)
      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: !!supabase && !!ciudad,
  })

// ─── DOCUMENTOS ────────────────────────────────────────────────────────────

export const useDocumentos = (personaId = null) =>
  useQuery({
    queryKey: ['documentos', personaId],
    queryFn: async () => {
      let q = supabase.from('documentos').select('*').order('created_at', { ascending: false })
      if (personaId) q = q.eq('persona_id', personaId)
      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: !!supabase,
  })

export const useUploadDocumento = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, persona_id, tipo_doc, entidad_tipo = 'persona', entidad_id }) => {
      const ext = file.name.split('.').pop()
      const path = `${entidad_tipo}/${persona_id ?? entidad_id}/${tipo_doc}-${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('documentos-viaje')
        .upload(path, file)
      if (upErr) throw upErr

      const { error: dbErr } = await supabase.from('documentos').insert({
        persona_id: persona_id ?? null,
        entidad_tipo,
        entidad_id: entidad_id ?? null,
        tipo_doc,
        storage_path: path,
        nombre_archivo: file.name,
      })
      if (dbErr) throw dbErr
      return path
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documentos'] }),
  })
}

export const useUpdateHotel = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { error } = await supabase.from('hoteles').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hoteles'] }),
  })
}

export const useUpdateVuelo = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { error } = await supabase.from('vuelos').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vuelos'] }),
  })
}

export const useDocumentoUrl = (storagePath) =>
  useQuery({
    queryKey: ['doc_url', storagePath],
    queryFn: async () => {
      const { data } = supabase.storage
        .from('documentos-viaje')
        .getPublicUrl(storagePath)
      return data.publicUrl
    },
    enabled: !!supabase && !!storagePath,
  })

// ─── GASTOS ────────────────────────────────────────────────────────────────

export const useGastos = (familia = null) =>
  useQuery({
    queryKey: ['gastos', familia],
    queryFn: async () => {
      let q = supabase
        .from('gastos')
        .select('*')
        .order('fecha', { ascending: false })
      if (familia) q = q.eq('pagado_por', familia)
      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: !!supabase,
  })

export const useAddGasto = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (gasto) => {
      const { error } = await supabase.from('gastos').insert(gasto)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gastos'] }),
  })
}

export const useDeleteGasto = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('gastos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gastos'] }),
  })
}

// ─── ACTIVIDADES ────────────────────────────────────────────────────────────

export const useActividades = (ciudad = null) =>
  useQuery({
    queryKey: ['actividades', ciudad],
    queryFn: async () => {
      let q = supabase.from('actividades').select('*').order('fecha', { nullsFirst: true }).order('nombre')
      if (ciudad) q = q.eq('ciudad', ciudad)
      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: !!supabase,
  })

export const useAddActividad = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (actividad) => {
      const { error } = await supabase.from('actividades').insert(actividad)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['actividades'] }),
  })
}

export const useUpdateActividad = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { error } = await supabase.from('actividades').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['actividades'] }),
  })
}
