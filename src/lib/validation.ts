export const PASSWORD_REQUIREMENTS_MESSAGE =
	"Password must include uppercase, lowercase, number, and special character.";

export const validatePasswordStrength = (password: string): string | null => {
	if (!password) {
		return "Password is required";
	}

	const hasUppercase = /[A-Z]/.test(password);
	const hasLowercase = /[a-z]/.test(password);
	const hasNumber = /\d/.test(password);
	const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);

	if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialCharacter) {
		return PASSWORD_REQUIREMENTS_MESSAGE;
	}

	return null;
};
