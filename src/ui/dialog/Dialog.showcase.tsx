import type { ShowcaseEntry } from "../../showcase/types";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from ".";
import { Button } from "../button";
import { Input } from "../input";

const entry: ShowcaseEntry = {
  title: "Dialog",
  group: "overlay",
  description: "A modal overlay for focused tasks like forms and confirmations, in small, medium, and large sizes.",
  demos: [
    {
      name: "Sizes",
      render: () => (
        <div className="flex flex-wrap justify-center gap-3">
          <Dialog>
            <DialogTrigger asChild><Button size="sm">Small</Button></DialogTrigger>
            <DialogContent size="sm">
              <DialogHeader><DialogTitle>Small dialog</DialogTitle></DialogHeader>
              <p className="text-sm text-muted">Compact dialog for quick actions.</p>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild><Button>Medium</Button></DialogTrigger>
            <DialogContent size="md">
              <DialogHeader><DialogTitle>Medium dialog</DialogTitle></DialogHeader>
              <p className="text-sm text-muted">Standard dialog size.</p>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild><Button>Large</Button></DialogTrigger>
            <DialogContent size="lg">
              <DialogHeader><DialogTitle>Large dialog</DialogTitle></DialogHeader>
              <p className="text-sm text-muted">Spacious dialog for forms.</p>
              <div className="space-y-3 mt-4">
                <Input placeholder="Field 1" />
                <Input placeholder="Field 2" />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
    {
      name: "Form example",
      render: () => (
        <div className="flex justify-center">
        <Dialog>
          <DialogTrigger asChild><Button>Edit profile</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>Make changes to your profile here.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Name" />
              <Input placeholder="Email" />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      ),
    },
  ],
};
export default entry;
