import React from "react";
import "./FormExport.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../../box/Loading.jsx";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import { dateToString } from "../../utils/date.jsx";
import FormLine from "../../button/FormLine.jsx";

export default class FormExport extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			format: "xlsx",
		};
	}

	export() {
		nm.info("The download will start soon...");

		let params = {
			id: this.props.form.id
			format: this.state.format,
		};

		if (this.state.filtered_entities_only) params = { ...params, ...this.props.filters };

		getBlobRequest.call(this, "entity/extract_form?" + dictToURI(params), (blob) => {
			const url = window.URL.createObjectURL(new Blob([blob]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "Export - form " + this.props.form.id + " - " + dateToString(new Date()) + ".xlsx");
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);
		}, (response) => {
			this.setState({ loading: false });
			nm.warning(response.statusText);
		}, (error) => {
			this.setState({ loading: false });
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="FormExport" className={"row"}>
				<div className="col-md-12">
					<h2>Global</h2>
				</div>

				<div className="col-md-12">
					{this.props.form
						? <div className="row">
							<div className="col-md-12">
								<FormLine
									label={"Get filtered entities only"}
									type={"checkbox"}
									value={this.state.filtered_entities_only}
									onChange={(v) => this.changeState("filtered_entities_only", v)}
								/>
								<FormLine
									label={"Include users"}
									type={"checkbox"}
									value={this.state.include_user}
									onChange={(v) => this.changeState("include_user", v)}
								/>
								<FormLine
									label={"Include contact emails"}
									type={"checkbox"}
									value={this.state.include_email}
									onChange={(v) => this.changeState("include_email", v)}
								/>
								<div className="right-buttons">
									<button
										onClick={this.export}>
										<i className="far fa-file-excel"/> Export
									</button>
								</div>
							</div>
						</div>
						: <Loading
							height={300}
						/>
					}
				</div>
			</div>
		);
	}
}
