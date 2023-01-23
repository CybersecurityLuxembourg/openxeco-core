import React from "react";
import "./FormQuestions.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import { dictToURI } from "../../../utils/url.jsx";
import FormLine from "../../button/FormLine.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";

export default class FormQuestions extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			questions: null,
			questionEnums: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.fetchQuestions();
		this.fetchQuestionEnums();
	}

	fetchQuestions() {
		const params = dictToURI({
			form_id: this.props.form.id,
		});

		getRequest.call(this, "form/get_form_questions?" + params, (data) => {
			this.setState({
				questions: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchQuestionEnums() {
		getRequest.call(this, "form/get_form_question_enums", (data) => {
			this.setState({
				questionEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addQuestion() {
		if (this.props.form.status !== "DELETED") {
			const params = {
				form_id: this.props.form.id,
			};

			postRequest.call(this, "form/add_form_question", params, () => {
				this.refresh();
				nm.info("The question has been added");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			nm.warning("This form is not editable");
		}
	}

	deleteQuestion(id) {
		if (this.props.form.status !== "DELETED") {
			const params = { id };

			postRequest.call(this, "form/delete_form_question", params, () => {
				this.refresh();
				nm.info("The question has been deleted");
			}, (response) => {
				this.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.refresh();
				nm.error(error.message);
			});
		} else {
			nm.warning("This form is not editable");
		}
	}

	updateQuestion(id, field, value) {
		if (this.props.form.status !== "DELETED") {
			const params = {
				id,
				[field]: value,
			};

			postRequest.call(this, "form/update_form_question", params, () => {
				this.refresh();
				nm.info("The question has been updated");
			}, (response) => {
				this.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.refresh();
				nm.error(error.message);
			});
		} else {
			nm.warning("This form is not editable");
		}
	}

	updateQuestionOrder(order) {
		if (this.props.form.status !== "DELETED") {
			const params = {
				form_id: this.props.form.id,
				question_order: order,
			};

			postRequest.call(this, "form/update_form_question_order", params, () => {
				this.refresh();
				nm.info("The question positions has been updated");
			}, (response) => {
				this.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.refresh();
				nm.error(error.message);
			});
		} else {
			nm.warning("This form is not editable");
		}
	}

	// eslint-disable-next-line class-methods-use-this
	onDragEnd(result) {
		const order = this.state.questions.map((q) => (q.id));
		const element = order[result.source.index];
		order.splice(result.source.index, 1);
		order.splice(result.destination.index, 0, element);
		this.updateQuestionOrder(order);
	}

	getQuestionBox(p, s, question) {
		const getItemStyle = (isDragging, draggableStyle) => ({
			...draggableStyle,
		});

		return <div
			className={"Droppable-element FormQuestion-question "
				+ (question.status !== "ACTIVE" && "FormQuestion-question-hidden")}
			ref={p.innerRef}
			{...p.draggableProps}
			{...p.dragHandleProps}
			style={getItemStyle(s.isDragging, p.draggableProps.style)}
		>
			<div className="row">
				<div className="col-md-12">
					<FormLine
						type={"select"}
						label={"Type"}
						options={this.state.questionEnums.type.map((o) => ({ label: o, value: o }))}
						value={question.type}
						onChange={(v) => this.updateQuestion(question.id, "type", v)}
						disabled={question.status === "DELETED"}
						labelWidth={3}
					/>
					<FormLine
						type={"editor"}
						label={"Question"}
						value={question.value}
						onBlur={(v) => this.updateQuestion(question.id, "value", v)}
						disabled={question.status === "DELETED"}
						labelWidth={3}
					/>
				</div>
				{["OPTIONS", "SELECT"].includes(question.type)
					&& <div className="col-md-12">
						<FormLine
							label={"Options (Sep. by \"|\")"}
							value={question.options}
							onBlur={(v) => this.updateQuestion(question.id, "options", v)}
							labelWidth={3}
						/>
					</div>
				}
				<div className="col-md-12">
					<FormLine
						label={"Reference"}
						value={question.reference}
						onBlur={(v) => this.updateQuestion(question.id, "reference", v)}
						labelWidth={3}
					/>
				</div>
				<div className="col-md-6">
					<FormLine
						type={"select"}
						label={"Status"}
						options={this.state.questionEnums.status.map((o) => ({ label: o, value: o }))}
						value={question.status}
						onChange={(v) => this.updateQuestion(question.id, "status", v)}
					/>
				</div>
				<div className="col-md-6">
					<div className="right-buttons">
						<DialogConfirmation
							text={"Are you sure you want to delete this question? "
								+ "This will remove all answers to this question. "
								+ "If you want to delete and keep the answers, please change "
								+ "the status to 'DELETED'"}
							trigger={
								<button
									className={"red-background"}>
									<i className="fas fa-trash-alt"/>
								</button>
							}
							afterConfirmation={() => this.deleteQuestion(question.id)}
						/>
					</div>
				</div>
			</div>
		</div>;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="FormQuestions" className={"row"}>
				<div className="col-md-8">
					<h2>Questions</h2>
				</div>

				<div className="col-md-4">
					{this.props.form.status !== "DELETED"
						&& <div className="top-right-buttons">
							<button
								className={"blue-background"}
								disabled={this.props.form.status === "DELETED"}
								title={"Add a new question"}
								onClick={() => this.addQuestion()}>
								<i className="fas fa-plus"/>
							</button>
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					}
				</div>

				{this.state.questions && this.state.questionEnums
					&& (this.state.questions.length > 0
						? <div className="col-md-12">
							<DragDropContext onDragEnd={(a) => this.onDragEnd(a)}>
								<Droppable droppableId="null" direction="vertical">
									{(provided) => (
										<div
											ref={provided.innerRef}
											{...provided.droppableProps}>
											{this.state.questions.map((item, index) => (
												<Draggable
													key={"" + item.id}
													draggableId={"" + item.id}
													index={index}>
													{(p, s) => this.getQuestionBox(p, s, item)}
												</Draggable>
											))}
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</DragDropContext>
						</div>
						: <div className="col-md-12">
							<Message
								text="No question found for this form"
								height={300}
							/>
						</div>
					)
				}

				{(!this.state.questions || !this.state.questionEnums)
					&& <div className="col-md-12">
						<Loading
							height={300}
						/>
					</div>
				}
			</div>
		);
	}
}
