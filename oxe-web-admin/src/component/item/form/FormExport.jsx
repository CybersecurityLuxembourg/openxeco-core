import React from "react";
import "./FormExport.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../../box/Loading.jsx";
import { getBlobRequest } from "../../../utils/request.jsx";
import { dateToString } from "../../../utils/date.jsx";
import FormLine from "../../button/FormLine.jsx";
import { dictToURI } from "../../../utils/url.jsx";

export default class FormExport extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			format: "xlsx",
		};
	}

	export() {
		nm.info("The download will start soon...");

		const params = {
			id: this.props.form.id,
			format: this.state.format,
		};

		getBlobRequest.call(this, "form/extract_form?" + dictToURI(params), (blob) => {
			const url = window.URL.createObjectURL(new Blob([blob]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "Export - form "
				+ this.props.form.id + " - "
				+ dateToString(new Date()) + "."
				+ this.state.format);
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
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
					<h2>Export</h2>
				</div>

				<div className="col-md-12">
					{this.props.form
						? <div className="row">
							<div className="col-md-12">
								<FormLine
									label={"Spreadsheet"}
									type={"checkbox"}
									value={this.state.format === "xlsx"}
									onChange={() => this.changeState("format", "xlsx")}
								/>
								<FormLine
									label={"JSON"}
									type={"checkbox"}
									value={this.state.format === "json"}
									onChange={() => this.changeState("format", "json")}
								/>
								<div className="right-buttons">
									<button
										onClick={() => this.export()}>
										<i className="far fa-file"/> Export
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
