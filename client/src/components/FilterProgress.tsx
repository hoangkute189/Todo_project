import { Select } from "antd";
// import { Dispatch, SetStateAction } from "react";
import { useSearchParams } from "react-router-dom";

// type PropType = {
//    setProgressFilter: Dispatch<SetStateAction<boolean | undefined>>;
// }

export default function FilterProgress() {
  const [, setSearchParams] = useSearchParams();

  const handleFilter = (value: true | false | "None") => {
    if (value == "None") {

      setSearchParams((prev) => {
        const urlSearchParams = new URLSearchParams(prev);
        urlSearchParams.delete("progress")
        return urlSearchParams
      })
    } else {

      setSearchParams((prev) => {
        const urlSearchParams = new URLSearchParams(prev);
        urlSearchParams.set("progress", JSON.stringify(value))
        return urlSearchParams
      })
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
