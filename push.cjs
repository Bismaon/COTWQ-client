const readline = require("readline");
const { exec } = require("child_process");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

console.log("WARNING: This action will push the build to the server.");

rl.question("Are you sure you want to proceed? (y/n): ", (answer) => {
	if (answer.toLowerCase() === "y") {
		console.log("Pushing the build...");
		const command =
			"ROBOCOPY build ../cotwq-server/public /E /XO /PURGE /IS /IT";

		exec(command, (err, stdout, stderr) => {
			if (err) {
				console.error("Error executing push:");
				console.error(`Command: ${command}`);
				console.error(`Error: ${err.message}`);
				console.error(`STDOUT: ${stdout}`);
				console.error(`STDERR: ${stderr}`);
				process.exit(1);
			} else {
				console.log(stdout);
				console.log("Push completed successfully.");
				process.exit(0);
			}
		});
	} else {
		console.log("Push canceled.");
		process.exit(0);
	}
});
