import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { Pagination } from ".";

function PaginationDemo() {
  const [page, setPage] = useState(1);
  return (
    <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
  );
}

const entry: ShowcaseEntry = {
  title: "Pagination",
  group: "navigation",
  demos: [
    {
      name: "Default (10 pages)",
      render: () => <PaginationDemo />,
    },
    {
      name: "Few pages",
      render: () => (
        <Pagination currentPage={2} totalPages={3} onPageChange={() => {}} />
      ),
    },
  ],
};
export default entry;
