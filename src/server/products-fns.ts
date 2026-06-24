import { createServerFn } from '@tanstack/react-start'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index'
import { products } from '../../db/schema'

export const DISEASE_TO_LABEL: Record<string, string> = {
  'Oeil-de-paon': 'Oeil de paon',
  'Black-scale': 'Cochenilles',
  'Psylle': 'Psylle',
}

export type ProductUsage = {
  dar: string
  dose: string
  max_appli: string
  culture_fr: string
  organisme_fr: string
  mode_traitement_fr: string
  periode_fr: string
}

export type ProductResult = {
  id: string
  nomFr: string
  numeroHomologation: string
  categorieFr: string
  formulationFr: string
  tableauToxicologique: string | null
  matieresFr: string[]
  imageUrl: string | null
  usage: ProductUsage
}

export const getProductsForDisease = createServerFn({ method: 'GET' }).handler(
  async ({ data }) => {
    const { diseaseName } = z.object({ diseaseName: z.string() }).parse(data)

    const labelName = DISEASE_TO_LABEL[diseaseName] ?? diseaseName
    const pattern = `%${labelName}%`

    console.log('[products] diseaseName:', diseaseName, '→ labelName:', labelName)

    // Étape 1 — tester sans filtre pour voir si la table est accessible
    const allRows = await db.select({ id: products.id }).from(products)
    console.log('[products] total rows in table:', allRows.length)

    // Étape 2 — requête avec filtre JSONB
    const rows = await db
      .select()
      .from(products)
      .where(
        sql`usages::jsonb @> ${JSON.stringify([{ organisme_fr: labelName, culture_fr: 'Olivier' }])}::jsonb`
      )

    console.log('[products] rows after filter:', rows.length)
    if (rows.length > 0) {
      console.log('[products] sample row usages:', JSON.stringify(rows[0].usages).slice(0, 200))
    }

    const results: ProductResult[] = []

    for (const row of rows) {
      const usages = (row.usages ?? []) as ProductUsage[]
      const matieresActives = (row.matieresActives ?? []) as { matiere_active_fr: string; teneur: string }[]
      const nomCommercial = (row.nomCommercial ?? {}) as { fr: string; ar: string }
      const categorie = (row.categorie ?? {}) as { fr: string; ar: string }
      const formulation = (row.formulation ?? {}) as { fr: string; ar: string }

      const relevantUsages = usages.filter(
        (u) =>
          u.culture_fr === 'Olivier' &&
          u.organisme_fr?.toLowerCase().includes(labelName.toLowerCase()),
      )

      for (const usage of relevantUsages) {
        results.push({
          id: row.id,
          nomFr: nomCommercial.fr ?? '',
          numeroHomologation: row.numeroHomologation ?? '',
          categorieFr: categorie.fr ?? '',
          formulationFr: formulation.fr ?? '',
          tableauToxicologique: row.tableauToxicologique ?? null,
          matieresFr: matieresActives.map((m) => `${m.matiere_active_fr} (${m.teneur})`),
          imageUrl: row.imageUrl ?? null,
          usage,
        })
      }
    }

    return { products: results, total: results.length, diseaseName: labelName }
  },
)