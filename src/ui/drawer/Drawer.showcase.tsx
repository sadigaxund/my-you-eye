import type { ShowcaseEntry } from "../../showcase/types";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter } from ".";
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
  ],
};
export default entry;
