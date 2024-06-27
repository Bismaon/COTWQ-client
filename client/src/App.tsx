// App.tsx

import './stylesheet/App.css';
import './stylesheet/style.css';
import Model from './pages/Model';
import Menus from './pages/Menus';
import UserForm from './components/UserForm';


function App() {
  return (
    <div>
      <div id="title">
        <h1>Countries Of The World Quizzes</h1>
      </div>
      <Menus />
      <Model />
      <UserForm/>
    </div>
  );
}


export default App;
