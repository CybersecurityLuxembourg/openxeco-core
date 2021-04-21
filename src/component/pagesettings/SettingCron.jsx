import React from "react";
import "./SettingCron.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../box/Loading.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import Log from "../item/Log.jsx";
import Message from "../box/Message.jsx";

export default class SettingCron extends React.Component {
	constructor(props) {
		super(props);

		this.getResources = this.getResources.bind(this);
		this.getLogs = this.getLogs.bind(this);

		this.state = {
			resources: null,
			logs: null,
			isTaskRunning: false,
		};
	}

	componentDidMount() {
		this.getResources();
		this.getLogs();
	}

	getResources() {
		this.setState({
			resources: null,
		});

		getRequest.call(this, "resource/get_resources", (data) => {
			this.setState({
				resources: data.filter((d) => d.startsWith("/cron/")),
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getLogs() {
		this.setState({
			logs: null,
		});

		getRequest.call(this, "log/get_logs?resource=%2Fcron%2F", (data) => {
			this.setState({
				logs: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	runCron(resource) {
		this.setState({
			isTaskRunning: true,
		});

		nm.info("The task is running. A notification will appear one finished.");

		postRequest.call(this, resource, null, () => {
			nm.info("The task has been executed with success");
			this.setState({
				isTaskRunning: false,
			});
		}, (response) => {
			nm.warning(response.statusText);
			this.setState({
				isTaskRunning: false,
			});
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<div id="SettingCron" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Scheduled task</h1>
						<h2>Run task</h2>
					</div>

					{this.state.resources !== null
						? <div className="col-md-12">
							{this.state.resources.map((r) => (
								<div
									className={"row"}
									key={r}>
									<div className="col-md-10">
										{r}
									</div>
									<div className="col-md-2 right-buttons">
										<button
											onClick={() => this.runCron(r)}
											disabled={this.state.isTaskRunning}>
											<i className="fas fa-play"/> Run
										</button>
									</div>
								</div>
							))}
						</div>
						: <Loading
							height={200}
						/>
					}
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Task logs</h2>

						<div className="top-right-buttons">
							<button
								onClick={this.getLogs}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>

						{this.state.logs !== null && this.state.logs.length > 0
							&& <div className="col-md-12">
								{this.state.logs.map((l) => (
									<Log
										key={"Log" + l.id}
										info={l}
									/>
								))}
							</div>
						}
						{this.state.logs !== null && this.state.logs.length === 0
							&& <Message
								text={"No log found for the scheduled tasks"}
								height={150}
							/>
						}
						{this.state.logs === null
							&& <Loading
								height={150}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
