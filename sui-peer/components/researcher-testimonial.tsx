import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ResearcherTestimonialProps {
  quote: string
  name: string
  role: string
  institution: string
  avatarSrc: string
}

export function ResearcherTestimonial({ quote, name, role, institution, avatarSrc }: ResearcherTestimonialProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-6">
        <div className="mb-4 flex-1">
          <p className="italic text-muted-foreground">"{quote}"</p>
        </div>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={name} />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">
              {role}, {institution}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
