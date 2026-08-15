import type { ShowcaseEntry } from "../../showcase/types";
import { Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter } from ".";
import { Button } from "../button";

const entry: ShowcaseEntry = {
  title: "Drawer",
  group: "overlay",
  demos: [
    {
      name: "Left & Right",
      render: () => (
        <div className="flex justify-center gap-3">
          <Drawer>
            <DrawerTrigger asChild>
              <Button>Open Left</Button>
            </DrawerTrigger>
            <DrawerContent side="left" size="sm">
              <DrawerHeader>
                <DrawerTitle>Left Drawer</DrawerTitle>
                <DrawerDescription>Slides in from the left.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <p className="text-sm text-muted">Content goes here.</p>
              </DrawerBody>
              <DrawerFooter>
                <DrawerTrigger asChild>
                  <Button variant="secondary">Close</Button>
                </DrawerTrigger>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Drawer>
            <DrawerTrigger asChild>
              <Button>Open Right</Button>
            </DrawerTrigger>
            <DrawerContent side="right" size="md">
              <DrawerHeader>
                <DrawerTitle>Right Drawer</DrawerTitle>
                <DrawerDescription>Slides in from the right.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <p className="text-sm text-muted">Content goes here.</p>
              </DrawerBody>
              <DrawerFooter>
                <DrawerTrigger asChild>
                  <Button variant="secondary">Close</Button>
                </DrawerTrigger>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      ),
    },
    {
      name: "Sizes",
      render: () => (
        <div className="flex flex-wrap justify-center gap-3">
          <Drawer>
            <DrawerTrigger asChild><Button size="sm">Small</Button></DrawerTrigger>
            <DrawerContent size="sm">
              <DrawerHeader>
                <DrawerTitle>Filters</DrawerTitle>
                <DrawerDescription>A narrow panel for a short control list.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <p className="text-sm text-muted">288px wide — status, owner, date range.</p>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
          <Drawer>
            <DrawerTrigger asChild><Button>Medium</Button></DrawerTrigger>
            <DrawerContent size="md">
              <DrawerHeader>
                <DrawerTitle>Deployment details</DrawerTitle>
                <DrawerDescription>The default width for record detail panels.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <p className="text-sm text-muted">384px wide — labelled fields and a log excerpt.</p>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
          <Drawer>
            <DrawerTrigger asChild><Button>Large</Button></DrawerTrigger>
            <DrawerContent size="lg">
              <DrawerHeader>
                <DrawerTitle>Edit pipeline</DrawerTitle>
                <DrawerDescription>Room for a full form without cramping labels.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <p className="text-sm text-muted">480px wide — multi-column forms and tables fit here.</p>
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DrawerClose>
                <Button>Save changes</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      ),
    },
  ],
};
export default entry;
