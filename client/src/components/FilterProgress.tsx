import { Select } from "antd";
import { Dispatch, SetStateAction } from "react";

type PropType = {
   setProgressFilter: Dispatch<SetStateAction<boolean | undefined>>;
}

export default function FilterProgress({ setProgressFilter } : PropType) {
  const handleFilter = (value: true | false | "None") => {
    if(value == "None") {
      setProgressFilter(undefined)
    } else {
      setProgressFilter(value)
    }
  };
  return (
    <div className="flex justify-between items-center">
      <span>Completed</span>
      <span>
        <Select defaultValue="None" onChange={handleFilter}>
          <Select.Option value="None">None</Select.Option>
          <Select.Option value={false}>In progress</Select.Option>
          <Select.Option value={true}>Done</Select.Option>
        </Select>
      </span>
    </div>
  );
}
