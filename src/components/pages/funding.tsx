"use client"

import { useI18n } from '@/lib/i18n'
import { ListPage } from '@/components/shared/list-page'
import { Card, CardContent } from '@/components/ui/card'
import { VerificationBadge, formatDate } from '@/components/shared/ui-helpers'
import { Badge } from '@/components/ui/badge'
import { Award, Building2, Calendar } from 'lucide-react'

export function FundingPage() {
  const { t, locale } = useI18n()
  return (
    <ListPage
      title={t('funding.title')}
      subtitle={t('funding.subtitle')}
      endpoint="/api/funding"
      navigateBase="funding"
      icon={Award}
      typeParam="type"
      typeFilters={[
        { value: 'government', label: t('funding.types.government') },
        { value: 'university', label: t('funding.types.university') },
        { value: 'institutional', label: t('funding.types.institutional') },
        { value: 'international', label: t('funding.types.international') },
        { value: 'travel', label: t('funding.types.travel') },
        { value: 'award', label: t('funding.types.award') },
        { value: 'innovation', label: t('funding.types.innovation') },
      ]}
      renderItem={(f) => (
        <Card className="hover:shadow-md h-full">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-[10px]">{t(`funding.types.${f.type}`)}</Badge>
              <VerificationBadge status={f.verification} />
            </div>
            <h3 className="font-medium text-sm line-clamp-2">{f.title}</h3>
            {f.funder && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Building2 className="h-3 w-3" /> {f.funder}</p>}
            {f.amount && <p className="text-xs mt-1">{t('funding.amount')}: {f.amount}</p>}
            {f.deadline && <p className="text-xs mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> {t('funding.deadline')}: {formatDate(f.deadline, locale)}</p>}
          </CardContent>
        </Card>
      )}
    />
  )
}
