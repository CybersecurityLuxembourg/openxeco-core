import React from "react";
import "./FormLine.css";
import * as moment from "moment";
import "react-datetime/css/react-datetime.css";
import Select from "react-select";
import Editor from "react-medium-editor";
import Datetime from "react-datetime";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import _ from "lodash";
/* import DialogSelectImage from "../dialog/DialogSelectImage.jsx"; */
import Chip from "./Chip.jsx";
import CheckBox from "./CheckBox.jsx";
import { validateUrl } from "../../utils/re.jsx";
/* import NoImage from "../box/NoImage.jsx";
import { getApiURL } from "../../utils/env.jsx"; */
import DialogError from "../dialog/DialogError.jsx";

function getSelectStyle() {
	return {
		input: () => ({
			height: "32px !important",
		}),
		control: (base, state) => ({
			...base,
			border: state.isFocused ? "2px solid #000 !important" : "2px solid lightgrey !important",
			boxShadow: 0,
		}),
		singleValue: (base) => ({
			...base,
			color: "inherit !important",
		}),
	};
}

export default class FormLine extends React.Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.getFormatClassName = this.getFormatClassName.bind(this);
		this.addValue = this.addValue.bind(this);
		this.deleteValue = this.deleteValue.bind(this);
		this.getField = this.getField.bind(this);

		this.state = {
			value: props.value,
		};
	}

	componentDidUpdate(prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({ value: this.props.value });
		}
	}

	onClick() {
		const newState = !this.props.value;
		if (typeof this.props.onClick !== "undefined" && this.props.disabled !== true) this.props.onClick(newState);
	}

	onChange(value) {
		this.setState({ value });

		if (typeof this.props.onChange !== "undefined") this.props.onChange(value);
	}

	onBlur(value) {
		if (typeof this.props.onBlur !== "undefined") this.props.onBlur(value);
	}

	addValue(valueToAdd) {
		if (this.state.value.indexOf(valueToAdd) < 0) {
			const value = _.cloneDeep(this.state.value);
			value.push(valueToAdd);
			this.setState({ value });
			this.props.onChange(value);
		}
	}

	deleteValue(valueToDelete) {
		let value = _.cloneDeep(this.state.value);
		value = value.filter((v) => v !== valueToDelete);
		this.setState({ value });
		this.props.onChange(value);
	}

	getFormatClassName() {
		if (this.props.format === undefined) {
			return "";
		}
		if (this.props.format(this.state.value)) return "FormLine-right-format";
		return "FormLine-wrong-format";
	}

	getField() {
		switch (this.props.type) {
		case "textarea":
			return <textarea
				value={this.state.value}
				onChange={(v) => this.onChange(v.target.value)}
				onBlur={(v) => this.onBlur(v.target.value)}
				disabled={this.props.disabled}
				autoFocus={this.props.autofocus}
				onKeyDown={this.props.onKeyDown}
			/>;
		case "checkbox":
			return <CheckBox
				label={this.props.innerLabel}
				value={this.state.value}
				onClick={(v) => this.onChange(v)}
				disabled={this.props.disabled}
				background={this.props.background}
			/>;
		case "select":
			return <Select
				value={{
					label: this.props.options
						.filter((o) => o.value === this.state.value).length > 0
						? this.props.options.filter((o) => o.value === this.state.value)[0].label
						: this.state.value,
					value: this.state.value,
				}}
				styles={getSelectStyle()}
				options={this.props.options}
				onChange={(v) => this.onChange(v.value)}
				isDisabled={this.props.disabled}
				aria-labelledby={"FormLine-label"}
			/>;
		case "url":
			return <div className={"FormLine-url"}>
				<input
					className={this.state.value && !validateUrl(this.state.value) && " FormLine-wrong-format"}
					type="url"
					value={this.state.value}
					onChange={(v) => this.onChange(v.target.value)}
					onBlur={(v) => this.onBlur(v.target.value)}
					disabled={this.props.disabled}
					autoFocus={this.props.autofocus}
					onKeyDown={this.props.onKeyDown}
				/>
				{this.state.value && !validateUrl(this.state.value)
					&& <DialogError
						content={
							<div>
								<h2>The URL format is not correct</h2>

								<div>Here are some examples of valid URLs:</div>

								<ul>
									<li>http://example.com/</li>
									<li>http://example.com/?test</li>
									<li>http://example.com/carrot#question</li>
									<li>https://example.com/</li>
									<li>https://example.com/?test</li>
									<li>https://example.com/carrot#question</li>
								</ul>

								<div>
									The URL should comply to the W3C URLs format for HTML5. More details <a
										href="https://www.w3.org/TR/2011/WD-html5-20110525/urls.html"
										target="_blank"
										rel="noreferrer">here</a>.
								</div>
							</div>
						}
					/>
				}
			</div>;
		case "multiselect":
			return <div>
				<Select
					value={null}
					styles={getSelectStyle()}
					options={this.props.options}
					onChange={(v) => this.addValue(v.value)}
				/>
				<div className="FormLine-chips">
					{(Array.isArray(this.state.value) ? this.state.value : []).map((o) => (
						<Chip
							key={o}
							label={this.props.options.filter((op) => op.value === o)[0].label}
							value={o}
							onClick={(v) => this.deleteValue(v)}
						/>
					))}
				</div>
			</div>;
		case "country":
			return <CountryDropdown
				className={this.getFormatClassName()}
				value={this.state.value}
				onChange={(value) => this.onChange(value)}
			/>;
		case "editor":
			return <Editor
				className={"medium-editor-element " + this.getFormatClassName()}
				text={this.state.value}
				onChange={(v) => this.onChange(v)}
				onBlur={() => this.onBlur(this.state.value)}
				options={{
					toolbar: { buttons: ["bold", "italic", "underline", "anchor", "quote", "unorderedlist"] },
					placeholder: { text: "" },
				}}
			/>;
		case "region":
			return <RegionDropdown
				className={this.getFormatClassName()}
				country={this.props.country}
				value={this.state.value}
				onChange={(value) => this.onChange(value)}
			/>;
		case "datetime":
			return <Datetime
				className={this.getFormatClassName()}
				value={this.state.value === null ? null : moment(this.state.value)}
				onChange={(v) => this.onChange(v)}
				onClose={() => this.onBlur(this.state.value)}
				disabled={this.props.disabled}
				autoFocus={this.props.autofocus}
				onKeyDown={this.props.onKeyDown}
				dateFormat={"YYYY-MM-DD"}
				timeFormat={"HH:mm"}
			/>;
		/* case "image":
			return <div className={"Formline-image-wrapper"}>
				<div className="Formline-image-display-wrapper"
					style={{ minHeight: this.props.height !== undefined ? this.props.height : 500 }}>
					{this.state.value !== null
						? <img
							className={"Formline-image"}
							src={getApiURL() + "public/get_public_image/" + this.state.value}
							onLoad={this.props.onLoad}
						/>
						: <NoImage/>
					}
				</div>
				<div className={"right-buttons"}>
					<button
						className={"red-background"}
						value={this.state.value}
						onClick={() => this.onChange(null)}
						disabled={this.state.value === null}>
						<i className="fas fa-trash-alt"/> Remove
					</button>
					<DialogSelectImage
						trigger={
							<button>
								<i className="fas fa-plus"/> {this.state.value === null ? "Select" : "Change"} image
							</button>
						}
						validateSelection={(value) => this.onChange(value)}
					/>
				</div>
			</div>; */
		default:
			return <input
				className={this.getFormatClassName()}
				type={typeof this.props.type !== "undefined" ? this.props.type : "text"}
				value={this.state.value}
				onChange={(v) => this.onChange(v.target.value)}
				onBlur={(v) => this.onBlur(v.target.value)}
				disabled={this.props.disabled}
				autoFocus={this.props.autofocus}
				onKeyDown={this.props.onKeyDown}
			/>;
		}
	}

	render() {
		let labelWidth = null;
		let fieldWidth = null;

		if (this.props.fullWidth) {
			labelWidth = "col-md-12";
			fieldWidth = "col-md-12";
		} else {
			labelWidth = "col-md-" + (this.props.labelWidth ? this.props.labelWidth : 6);
			fieldWidth = "col-md-" + (this.props.labelWidth ? 12 - this.props.labelWidth : 6);
		}

		return (
			<div className={"FormLine"}>
				<div className={"row"}>
					<div className={labelWidth}>
						<div id={"FormLine-label"} className={"FormLine-label"}>
							{this.props.label}
						</div>
					</div>
					<div className={fieldWidth}>
						{this.getField()}
					</div>
				</div>
			</div>
		);
	}
}
