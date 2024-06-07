// App.tsx

import './stylesheet/App.css';
import './stylesheet/style.css';
import Model from './pages/Model';
import Menus from './pages/Menus';


function App() {
  return (
    <div>
      <div id="title">
        <h1>Countries Of The World Quizzes</h1>
      </div>
      <Menus/>
      <Model />
    </div>
  );
}


export default App;
