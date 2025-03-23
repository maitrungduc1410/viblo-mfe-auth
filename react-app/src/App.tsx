import "./App.css";
import reactLogo from "../public/react.svg?inline";
import rsPackLogo from "../public/rspack.png";

export type Data = {
  channel: string;
  data: any;
};

interface IProps {
  inputData?: Data;
  outputData?: (data: Data) => void;
}

const App = (props: IProps) => {
  return (
    <div className="content">
      <div>
        <img src={reactLogo} alt="React Logo" width={50} />
      </div>
      <h2>Input Data</h2>
      <pre>{JSON.stringify(props.inputData, null, 2)}</pre>
      <div>
        <button
          onClick={() =>
            props.outputData?.({
              channel: "REACT_WIDGET",
              data: "Hello from React",
            })
          }
        >
          Click me
        </button>
      </div>
    </div>
  );
};

export default App;
