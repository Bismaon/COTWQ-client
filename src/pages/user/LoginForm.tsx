import React, { useState } from "react";
import { checkUserSession } from "../../user/userStorage";
import CreateAccountForm from "./CreateAccountForm";
import UserForm from "./UserForm";
import { useTranslation } from "react-i18next";
import { handleLogin, togglePasswordVisibility } from "../../utils/loginUtils"; // Adjust the import path accordingly

interface LoginFormProps {
	onSessionChange: () => void; // Callback to notify parent about session change
}

const LoginForm: React.FC<LoginFormProps> = ({ onSessionChange }) => {
	const [showCreateAccountForm, setShowCreateAccountForm] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [logged, setLogged] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const { t } = useTranslation();

	if (showCreateAccountForm) {
		return <CreateAccountForm onSessionChange={onSessionChange} />;
	} else if (logged || checkUserSession() !== -1) {
		return <UserForm onSessionChange={onSessionChange} />;
	}

	const handleShowPassword = () => {
		const passwordInput = document.getElementById(
			"password"
		) as HTMLInputElement;
		setShowPassword(!showPassword);
		togglePasswordVisibility(passwordInput, showPassword);
	};

	return (
		<form
			className="grid-profile-container"
			name="login-form"
			onSubmit={(event) =>
				handleLogin(
					event,
					username,
					password,
					onSessionChange,
					setLogged,
					setError
				)
			}
		>
			<label className="grid-item" htmlFor="username">
				{t("username")}
			</label>
			<div className="grid-item inputDiv">
				<input
					type="text"
					value={username}
					name="username"
					id="username"
					autoComplete="username"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setUsername(e.target.value)
					}
					required
				/>
				<div className="status-icon" />
			</div>

			<label className="grid-item" htmlFor="password">
				{t("password")}
			</label>
			<div className="grid-item inputDiv">
				<input
					type="password"
					value={password}
					name="password"
					id="password"
					autoComplete="new-password"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setPassword(e.target.value)
					}
					required
					minLength={8}
				/>
				{showPassword ? (
					<i
						className="fa-regular fa-eye-slash"
						onClick={handleShowPassword}
					></i>
				) : (
					<i
						className="fa-regular fa-eye"
						onClick={handleShowPassword}
					></i>
				)}
			</div>

			<div className="grid-item">
				<button
					className="button"
					onClick={() => setShowCreateAccountForm(true)}
				>
					{t("noAccount")}
				</button>
				<button className="button" type="submit">
					{t("login")}
				</button>
			</div>

			{error && <p style={{ color: "red" }}>{error}</p>}
		</form>
	);
};

export default LoginForm;
