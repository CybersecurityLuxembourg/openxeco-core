import React from "react";
import "./TaskDataControlLaunch.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../../box/Loading.jsx";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import Log from "../../item/Log.jsx";
import Message from "../../box/Message.jsx";
import FormLine from "../../button/FormLine.jsx";
import { dictToURI } from "../../../utils/url.jsx";
import { getSettingValue } from "../../../utils/setting.jsx";

export default class TaskDataControlLaunch extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			resources: null,
			logs: null,
			isTaskRunning: false,

			per_page: 10,
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

	addSetting(property, value) {
		const params = {
			property,
			value,
		};

		postRequest.call(this, "setting/add_setting", params, () => {
			this.props.refreshSettings();
			nm.info("The setting has been added");
		}, (response) => {
			this.props.refreshSettings();
			nm.warning(response.statusText);
		}, (error) => {
			this.props.refreshSettings();
			nm.error(error.message);
		});
	}

	deleteSetting(property) {
		const params = {
			property,
		};

		postRequest.call(this, "setting/delete_setting", params, () => {
			this.props.refreshSettings();
			nm.info("The setting has been deleted");
		}, (response) => {
			this.props.refreshSettings();
			nm.warning(response.statusText);
		}, (error) => {
			this.props.refreshSettings();
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
			<div id="TaskDataControlLaunch" className="fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Launch scan</h2>
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
						<h2>Database compliance settings</h2>

						<h3>Entities</h3>

						<FormLine
							type={"checkbox"}
							label={"Highlight entities without image"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_IMAGE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_IMAGE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_IMAGE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities without website"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_WEBSITE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_WEBSITE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_WEBSITE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities without postal address"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_POSTAL_ADDRESS") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_POSTAL_ADDRESS", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_POSTAL_ADDRESS")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities with postal address missing geolocation"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITH_POSTAL_ADDRESS_MISSING_GEOLOCATION") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITH_POSTAL_ADDRESS_MISSING_GEOLOCATION", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITH_POSTAL_ADDRESS_MISSING_GEOLOCATION")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities without phone number"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_PHONE_NUMBER") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_PHONE_NUMBER", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_PHONE_NUMBER")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities without email address"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_EMAIL_ADDRESS") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_EMAIL_ADDRESS", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_EMAIL_ADDRESS")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities without creation date"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_CREATION_DATE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_CREATION_DATE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_CREATION_DATE")
							)}
						/>
						<br/>

						<h3>Articles</h3>
						<FormLine
							type={"checkbox"}
							label={"Highlight articles without title"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_TITLE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_TITLE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_TITLE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight articles without handle"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_HANDLE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_HANDLE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_HANDLE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight articles without publication date"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_PUBLICATION_DATE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_PUBLICATION_DATE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_PUBLICATION_DATE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight articles without content"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_CONTENT") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_CONTENT", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_CONTENT")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight events without start date"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_START_DATE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_START_DATE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_START_DATE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight events without end date"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_END_DATE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_END_DATE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_END_DATE")
							)}
						/>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Scan logs</h2>

						<div className="top-right-buttons">
							<button
								onClick={() => this.refreshLogs()}>
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
								text={"No log found for the scan"}
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
