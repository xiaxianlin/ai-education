import "./index.scss";
import SimplePage from "@/components/common/simple-page";
import { useDeviceList } from "@/hooks";
import { Cell, List, Loading } from "@taroify/core";

export default function Home() {
  const { loading, data } = useDeviceList();
  console.log("[LOG_INFO]", data);
  return (
    <SimplePage title="我的设备">
      <List loading={loading}>
        {data.map((item) => (
          <Cell key={item.id}>{item.address}</Cell>
        ))}
        <List.Placeholder>
          {loading && <Loading>加载中...</Loading>}
        </List.Placeholder>
      </List>
    </SimplePage>
  );
}
