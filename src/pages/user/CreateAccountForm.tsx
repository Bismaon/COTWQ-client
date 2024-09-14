import React, { useState } from "react";
import "../../stylesheet/style.css";
import "../../stylesheet/profile.css";
import { checkUserSession, loginUser } from "../../user/userStorage";
import LoginForm from "./LoginForm";
import UserForm from "./UserForm";
import { useTranslation } from "react-i18next";

interface CreateAccountFormProps {
	onSessionChange: () => void; // Callback to notify parent about session change
}

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
	onSessionChange,
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showLoginForm, setShowLoginForm] = useState(false);
	const [logged, setLogged] = useState(false);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const { t, i18n } = useTranslation();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	if (showLoginForm) {
		return <LoginForm onSessionChange={onSessionChange} />;
	} else if (logged || checkUserSession() !== -1) {
		return <UserForm onSessionChange={onSessionChange} />;
	}

	const handleShowPassword = () => {
		const passwordInput = document.getElementById(
			"password1"
		) as HTMLInputElement;
		setShowPassword(!showPassword);
		const type =
			passwordInput.getAttribute("type") === "password"
				? "text"
				: "password";
		passwordInput.setAttribute("type", type);
	};
	const handleCreateAccount = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		try {
			const response = await fetch("/users/create-account", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, username, password }),
			});

			console.debug("Raw response:", response);

			if (response.ok) {
				const data = await response.json();
				const { id } = data[0];
				console.debug("Parsed response:", data);
				loginUser(id);
				setLogged(true);
				onSessionChange(); // Notify parent component about session change
				console.debug("User logged in: ", id);
				alert("Account created successfully!");
			} else {
				const errorText: string = await response.text();
				setError(`Failed to create account: ${errorText}`);
			}
		} catch (error) {
			console.error("Error creating account:", error);
			setError("An error occurred during account creation.");
		}
	};

	return (
		<form
			className="grid-profile-container"
			name="create-account-form"
			onSubmit={handleCreateAccount}
		>
			<label className="grid-item" htmlFor="email">
				{t("email")}
			</label>
			<div className="grid-item inputDiv">
				<input
					type="email"
					value={email}
					id="email"
					name="email"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setEmail(e.target.value)
					}
					required
				/>
				<div className="status-icon" />
			</div>

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

			<label className="grid-item" htmlFor="password1">
				{t("password")}
			</label>
			<div className="grid-item inputDiv">
				<input
					type="password"
					value={password}
					name="password1"
					id="password1"
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

			<label className="grid-item" htmlFor="password2">
				Re-enter Password:
			</label>
			<div className="grid-item inputDiv">
				<input
					type="password"
					value={confirmPassword}
					name="password2"
					id="password2"
					autoComplete="new-password"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setConfirmPassword(e.target.value)
					}
					required
					minLength={8}
				/>
			</div>

			<div className="grid-item">
				<button
					className="button"
					onClick={() => setShowLoginForm(true)}
				>
					{t("hasAccount")}
				</button>
				<button className="button" type="submit">
					{t("noAccount")}
				</button>
			</div>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</form>
	);
};

export default CreateAccountForm;
