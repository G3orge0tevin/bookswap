import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
        </DialogHeader>
        {/* Later: add your sign-in form here */}
        <p className="text-sm text-gray-600">Auth form coming soon...</p>
      </DialogContent>
    </Dialog>
  )
}
