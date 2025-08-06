import { PartnerLogosDisplay } from "./PartnerLogosDisplay"

export const UnifiedOrganizationManager = () => {
  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Strategic Partners & Organizations
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Building strategic partnerships across global institutions to advance corridor economics research and implementation.
        </p>
      </div>
      
      <PartnerLogosDisplay />
    </div>
  )
}