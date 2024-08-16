import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import UserInformation from "../components/UserInformation";

const ProfileMenu: React.FC = () => {
  const navigate = useNavigate();
  console.log("Rendering ProfileMenu");
  return (
    <>
      <div className="grid-item" id="title">
        <h1>Countries Of The World Quizzes</h1>
      </div>
      <div className="grid-item" id="back">
	  	<i className="fa-solid fa-arrow-left grid-item" onClick={()=>navigate(-1)}></i>
      </div>
      <div className="grid-item" id="menu">
        <button className="button">Edit</button>
      </div>
      {/* <div id="profile-box" className='transparent-box'>
		  {userID ? (<UserInformation userID={userID} />)
			: (<LoginForm setUserID={setUserID} />)}
		</div> */}
    </>
  );
};
export default ProfileMenu;
