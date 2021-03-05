import React from "react";
import "./DialogConfirmationWithTextField.css";
import Popup from "reactjs-popup";
import FormLine from "../button/FormLine";

export default class DialogConfirmationWithTextField extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
		this.afterConfirmation = this.afterConfirmation.bind(this);
		this.cancel = this.cancel.bind(this);

		this.state = {
			value: null,
		};
	}

	componentDidMount() {

	}

	afterConfirmation() {
		this.props.afterConfirmation(this.state.value);
		document.elementFromPoint(100, 0).click();
	}

	cancel() {
		document.elementFromPoint(100, 0).click();
	}

	render() {
		return (
			<Popup
				trigger={this.props.trigger}
				modal
				closeOnDocumentClick
				className={"DialogConfirmationWithTextField"}
			>
				<div className={"DialogConfirmationWithTextField-wrapper"}>
					<h2>{this.props.text}</h2>
					<FormLine
						label={this.props.fieldName}
						value={this.state.value}
						onChange={(v) => this.setState({ value: v })}
					/>
					<div className={"bottom-right-buttons"}>
						<button
							className={"grey-background"}
							data-hover="Cancel"
							data-active=""
							onClick={this.cancel}>
							<span><i className="far fa-times-circle"/> Cancel</span>
						</button>
						<button
							data-hover="Yes"
							data-active=""
							onClick={this.afterConfirmation}>
							<span><i className="far fa-check-circle"/> Yes</span>
						</button>
					</div>
				</div>
			</Popup>
		);
	}
}
