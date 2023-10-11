import React from "react";
import "./FormLine.css";
import * as moment from "moment";
import "react-datetime/css/react-datetime.css";
import Select from "react-select";
import Editor from "react-medium-editor";
import Datetime from "react-datetime";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import _ from "lodash";
import DialogSelectImage from "../dialog/DialogSelectImage.jsx";
import Chip from "./Chip.jsx";
import CheckBox from "./CheckBox.jsx";
import NoImage from "../box/NoImage.jsx";
import { getApiURL } from "../../utils/env.jsx";
import { validateUrl } from "../../utils/re.jsx";
import DialogSelectDocument from "../dialog/DialogSelectDocument.jsx";
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
		menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
		menu: (provided) => ({ ...provided, zIndex: 9999 }),
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
		if (this.props.onClick && this.props.disabled !== true) this.props.onClick(newState);
	}

	onChange(value) {
		this.setState({ value });

		if (this.props.onChange) this.props.onChange(value);
	}

	onBlur(value) {
		if (this.props.onBlur) this.props.onBlur(value);
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
				disabled={this.props.disabled}
			/>;
		case "editor":
			return <Editor
				className={"medium-editor-element " + this.getFormatClassName()}
				text={this.state.value}
				onChange={(v) => this.onChange(v)}
				onBlur={() => this.onBlur(this.state.value)}
				options={{
					toolbar: {
						buttons: ["bold", "italic", "underline", "anchor", "quote", "unorderedlist"],
					},
					paste: {
						forcePlainText: false,
						cleanPastedHTML: true,
						cleanAttrs: ["class", "style", "dir", "rel", "id", "aria-hidden"],
						cleanTags: ["svg"],
						unwrapTags: ["h1", "h2", "h3", "h4", "h5", "div", "code", "span"],
					},
					placeholder: {
						text: "",
					},
				}}
				data-disable-editing={this.props.disabled || undefined}
			/>;
		case "region":
			return <RegionDropdown
				className={this.getFormatClassName()}
				country={this.props.country}
				value={this.state.value}
				onChange={(value) => this.onChange(value)}
				disabled={this.props.disabled}
			/>;
		case "datetime":
			return <Datetime
				className={this.getFormatClassName()}
				value={this.state.value === null ? null : moment(this.state.value)}
				onChange={(v) => this.onChange(v)}
				onClose={() => this.onBlur(this.state.value)}
				autoFocus={this.props.autofocus}
				onKeyDown={this.props.onKeyDown}
				dateFormat={"YYYY-MM-DD"}
				timeFormat={"HH:mm"}
				renderInput={(props, openCalendar) => <div className={"Formline-datetime"}>
					<input {...props} />
					<button onClick={openCalendar}>open calendar</button>
				</div>}
				inputProps={{
					disabled: this.props.disabled,
				}}
				{...(this.props.disabled ? { open: !this.props.disabled } : {})}
			/>;
		case "image":
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
				{!this.props.disabled
					&& <div className={"centered-buttons"}>
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
									<i className="fas fa-redo-alt"/> {this.state.value === null ? "Select" : "Change"} image
								</button>
							}
							validateSelection={(value) => this.onChange(value)}
						/>
					</div>
				}
			</div>;
		case "document":
			return <div className={"FormLine-document"}>
				<input
					className={this.getFormatClassName()}
					value={this.state.value ? "ID: " + this.state.value : "No document selected"}
					disabled={true}
				/>
				<div className={"right-buttons"}>
					<button
						className={"small-button red-background"}
						value={this.state.value}
						onClick={() => this.onChange(null)}
						disabled={this.props.disabled || this.state.value === null}>
						<i className="fas fa-trash-alt"/>
					</button>
					<button
						className={"small-button"}
						onClick={() => window.open(getApiURL() + "public/get_public_document/" + this.state.value, "_blank")}
						disabled={this.state.value === null}>
						<i className="fas fa-eye"/>
					</button>
					<DialogSelectDocument
						trigger={
							<button
								className="small-button"
								disabled={this.props.disabled}>
								<i className="fas fa-mouse-pointer"/>
							</button>
						}
						validateSelection={(value) => this.onChange(value)}
					/>
				</div>
			</div>;
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
					{this.props.label
						&& <div className={labelWidth}>
							<div className={"FormLine-label"}>
								{this.props.label}
							</div>
						</div>
					}
					<div className={fieldWidth}>
						{this.getField()}
					</div>
				</div>
			</div>
		);
	}
}
