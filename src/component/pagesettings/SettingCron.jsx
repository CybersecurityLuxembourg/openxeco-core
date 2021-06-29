import React from "react";
import "./SettingCron.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../box/Loading.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import Log from "../item/Log.jsx";
import Message from "../box/Message.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class SettingCron extends React.Component {
	constructor(props) {
		super(props);

		this.getResources = this.getResources.bind(this);
		this.refreshLogs = this.refreshLogs.bind(this);
		this.getLogs = this.getLogs.bind(this);

		this.state = {
			resources: null,
			logs: null,
			isTaskRunning: false,

			per_page: 20,
			page: 1,
			order: "desc",
			showLoadMoreButton: true,
		};
	}

	componentDidMount() {
		this.getResources();
		this.refresh();
	}

	refresh() {
		this.setState({
			logs: null,
			page: 1,
		}, () => {
			this.getLogs();
		});
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

	refreshLogs() {
		this.setState({
			logs: null,
			page: 1,
		}, () => {
			const params = {
				order: this.state.order,
				page: this.state.page,
				per_page: this.state.per_page,
			};

			getRequest.call(this, "log/get_logs?resource=%2Fcron%2F&" + dictToURI(params), (data) => {
				this.setState({
					logs: data.items,
					page: 2,
					showLoadMoreButton: data.pagination.page < data.pagination.pages,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	getLogs() {
		const params = {
			order: this.state.order,
			page: this.state.page,
			per_page: this.state.per_page,
		};

		getRequest.call(this, "log/get_logs?resource=%2Fcron%2F&" + dictToURI(params), (data) => {
			this.setState({
				logs: (this.state.logs === null ? [] : this.state.logs).concat(data.items),
				page: this.state.page + 1,
				showLoadMoreButton: data.pagination.page < data.pagination.pages,
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

		nm.info("The task is running. A notification will appear once finished.");

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
								onClick={this.refreshLogs}>
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

				<div className={"row row-spaced"}>
					<div className="col-md-12 centered-buttons">
						{this.state.showLoadMoreButton
							? <button
								className={"blue-background"}
								onClick={() => this.getLogs()}>
								<i className="fas fa-plus"/> Load more logs
							</button>
							: <button
								className={"blue-background"}
								disabled={true}>
								No more log to load
							</button>
						}
					</div>
				</div>
			</div>
		);
	}
}
