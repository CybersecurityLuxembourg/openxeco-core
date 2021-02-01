import React from 'react';
import './SettingTaxonomy.css';
import Loading from "../box/Loading";
import Table from '../table/Table';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../utils/request';
import FormLine from '../button/FormLine';
import DialogConfirmation from '../dialog/DialogConfirmation';
import {dictToURI} from '../../utils/url';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


export default class SettingTaxonomy extends React.Component {

	constructor(props){
		super(props);

		this.refresh = this.refresh.bind(this);
		this.getValues = this.getValues.bind(this);
		this.getValueHierarchy = this.getValueHierarchy.bind(this);
		this.addCategory = this.addCategory.bind(this);
		this.addCategoryHierarchy = this.addCategoryHierarchy.bind(this);
		this.addValue = this.addValue.bind(this);
		this.deleteCategory = this.deleteCategory.bind(this);
		this.deleteCategoryHierarchy = this.deleteCategoryHierarchy.bind(this);
		this.deleteValue = this.deleteValue.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.saveValueHierarchy = this.saveValueHierarchy.bind(this);

		this.state = {
			categories: null,
			categoryHierarchy: null,
			selectedCategory: null,
			selectedCategoryHierarchy: null,
			values: null,
			valueHierarchy: null,
			newValue: null,
			newCategory: null,
			newParentCategory: null,
			newChildCategory: null,
		}
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevState.selectedCategory !== this.state.selectedCategory) {
			if (this.state.selectedCategory === null) {
				this.setState({
					values: null
				});
			} else {
				this.getValues();
			}
		}

		if (prevState.selectedCategoryHierarchy !== this.state.selectedCategoryHierarchy) {
			if (this.state.selectedCategoryHierarchy === null) {
				this.setState({
					valueHierarchy: null
				});
			} else {
				this.getValueHierarchy();
			}
		}
	}

	refresh() {
		this.setState({
			categories: null,
			categoryHierarchy: null,
			selectedCategory: null,
			selectedCategoryHierarchy: null,
			values: null,
			valueHierarchy: null,
		});

		getRequest.call(this, "taxonomy/get_taxonomy_categories", data => {
            this.setState({
                categories: data,
            }, () => {
            	getRequest.call(this, "taxonomy/get_taxonomy_category_hierarchy", data => {
		            this.setState({
		                categoryHierarchy: data,
		            });
		        }, response => {
		            nm.warning(response.statusText);
		        }, error => {
		            nm.error(error.message);
		        });
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });

        if (this.state.selectedCategory !== null) {
        	this.getValues(this.state.selectedCategory);
        }
	}

	getValues() {
		this.setState({
			values: null
		});
		
		getRequest.call(this, "taxonomy/get_taxonomy_values?" + dictToURI({"category": this.state.selectedCategory}), data => {
            this.setState({
                values: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	getValueHierarchy() {
		this.setState({
			valueHierarchy: null
		});

		let args = dictToURI({
			parent_category: this.state.selectedCategoryHierarchy.split(" - ")[0],
			child_category: this.state.selectedCategoryHierarchy.split(" - ")[1],
		})
		
		getRequest.call(this, "taxonomy/get_taxonomy_value_hierarchy?" + args, data => {
            this.setState({
                valueHierarchy: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	addCategory() {
		let params = {
			category: this.state.newCategory,
    	}

    	postRequest.call(this, "taxonomy/add_taxonomy_category", params, response => {
            this.refresh();
            this.setState({ newCategory: null });
            nm.info("The category has been added");
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	addCategoryHierarchy() {
		let params = {
			parent_category: this.state.newParentCategory,
			child_category: this.state.newChildCategory,
    	}

    	postRequest.call(this, "taxonomy/add_taxonomy_category_hierarchy", params, response => {
            this.refresh();
            this.setState({ 
            	newParentCategory: null,
            	newChildCategory: null
            });
            nm.info("The hierarchy has been added");
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	addValue() {
		let params = {
			category: this.state.selectedCategory,
    		value: this.state.newValue
    	}

    	postRequest.call(this, "taxonomy/add_taxonomy_value", params, response => {
            this.getValues();
            this.setState({ newValue: null });
            nm.info("The value has been added");
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	deleteCategory(value) {
        let params = {
			category: value,
    	}

        postRequest.call(this, "taxonomy/delete_taxonomy_category", params, response => {
            document.elementFromPoint(100, 0).click();
            this.refresh();
            nm.info("The value has been deleted");
        }, response => {
            this.refresh();
            nm.warning(response.statusText);
        }, error => {
            this.refresh();
            nm.error(error.message);
        });
    }

    deleteCategoryHierarchy(parent, child) {
        let params = {
			parent_category: parent,
    		child_category: child
    	}

        postRequest.call(this, "taxonomy/delete_taxonomy_category_hierarchy", params, response => {
            document.elementFromPoint(100, 0).click();
            this.refresh();
            nm.info("The value has been deleted");
        }, response => {
            this.refresh();
            nm.warning(response.statusText);
        }, error => {
            this.refresh();
            nm.error(error.message);
        });
    }

	deleteValue(value, category) {
        let params = {
			category: category,
    		name: value
    	}

        postRequest.call(this, "taxonomy/delete_taxonomy_value", params, response => {
            document.elementFromPoint(100, 0).click();
            this.getValues();
            nm.info("The value has been deleted");
        }, response => {
            this.refresh();
            nm.warning(response.statusText);
        }, error => {
            this.refresh();
            nm.error(error.message);
        });
    }

    saveValueHierarchy() {
    	let params = {
			parent_category: this.state.selectedCategoryHierarchy.split(" - ")[0],
			child_category: this.state.selectedCategoryHierarchy.split(" - ")[1],
    		value_hierarchy: this.state.valueHierarchy.value_hierarchy
    	}

    	postRequest.call(this, "taxonomy/save_value_hierarchy", params, response => {
            this.getValueHierarchy();
            nm.info("The value hierarchy has been saved");
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    onDragEnd(result) {
	    if (!result.destination) {
	      	return;
	    }

	    let params = {
			parent_value: parseInt(result.destination.droppableId),
    		child_value: parseInt(result.draggableId)
    	}

	    let valueHierarchy = _.cloneDeep(this.state.valueHierarchy);

	    valueHierarchy["value_hierarchy"] = valueHierarchy["value_hierarchy"]
	    	.filter(h => h.child_value !== parseInt(result.draggableId));

	    if (result.destination.droppableId !== "null") {

		    postRequest.call(this, "taxonomy/add_taxonomy_value_hierarchy", params, response => {
	            nm.info("The modification has been saved");

	            valueHierarchy["value_hierarchy"] = valueHierarchy["value_hierarchy"]
	    			.filter(h => h.child_value !== parseInt(result.draggableId));

	            valueHierarchy["value_hierarchy"].push(params);

			    this.setState({ valueHierarchy: valueHierarchy });
	        }, response => {
	            nm.warning(response.statusText);
	        }, error => {
	            nm.error(error.message);
	        });
		} else {
			postRequest.call(this, "taxonomy/delete_taxonomy_value_hierarchy", params, response => {
	            nm.info("The modification has been saved");

	            valueHierarchy["value_hierarchy"] = valueHierarchy["value_hierarchy"]
	    			.filter(h => h.child_value !== parseInt(result.draggableId));

			    this.setState({ valueHierarchy: valueHierarchy });
	        }, response => {
	            nm.warning(response.statusText);
	        }, error => {
	            nm.error(error.message);
	        });
		}
	}

	changeState(field, value) {
        this.setState({[field]: value});
    }

	render() {
		const getItemStyle = (isDragging, draggableStyle) => ({
			...draggableStyle,
		});

		let categoryColumns = [
            {
              Header: 'Category',
              accessor: 'name',
          	},
          	{
                Header: ' ',
                accessor: x => { return x },
                Cell: ({ cell: { value } }) => (
                    <DialogConfirmation
                        text={"Are you sure you want to delete this category?"}
                        trigger={
                            <button
                                className={"small-button red-background Table-right-button"}>
                                <i className="fas fa-trash-alt"/>
                            </button>
                        }
                        afterConfirmation={() => this.deleteCategory(value.name)}
                    />
                ),
                width: 50,
            },
        ];

        let categoryHierarchyColumns = [
	          {
	            Header: 'Parent category',
	            accessor: 'parent_category',
	          },
	          {
	            Header: 'Child category',
	            accessor: 'child_category',
	          },
	          {
                Header: ' ',
                accessor: x => { return x },
                Cell: ({ cell: { value } }) => (
                    <DialogConfirmation
                        text={"Are you sure you want to delete this hierarchy?"}
                        trigger={
                            <button
                                className={"small-button red-background Table-right-button"}>
                                <i className="fas fa-trash-alt"/>
                            </button>
                        }
                        afterConfirmation={() => this.deleteCategoryHierarchy(value.parent_category, value.child_category)}
                    />
                ),
                width: 50,
	           },
        ];

        let valueColumns = [
	          {
	            Header: 'Name',
	            accessor: 'name',
	          },
	          {
                Header: ' ',
                accessor: x => { return x },
                Cell: ({ cell: { value } }) => (
                    <DialogConfirmation
                        text={"Are you sure you want to delete this value?"}
                        trigger={
                            <button
                                className={"small-button red-background Table-right-button"}>
                                <i className="fas fa-trash-alt"/>
                            </button>
                        }
                        afterConfirmation={() => this.deleteValue(value.name, value.category)}
                    />
                ),
                width: 50,
              },
        ];

		return (
			<div id="SettingCompanyValues" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Taxonomy</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-6">
						<h2>Categories</h2>
						{this.state.categories !== null ?
							<div className="row">
	                            <div className="col-xl-12">
	                                <FormLine
	                                    label={"New category"}
	                                    value={this.state.newCategory}
	                                    onChange={v => this.changeState("newCategory", v)}
	                                />
	                            </div>
	                            <div className="col-xl-12 right-buttons">
	                                <button
	                                    className={"blue-background"}
	                                    onClick={this.addCategory}>
	                                    <i className="fas fa-plus"/> Add category
	                                </button>
	                            </div>
	                            <div className="col-xl-12">
		                            <Table
										columns={categoryColumns}
										data={this.state.categories}
									/>
								</div>
	                        </div>
	                    :
	                    	<Loading
	                    		height={100}
	                    	/>
	                    }
					</div>
					<div className="col-md-6">
						<h2>Category hierarchy</h2>
						{this.state.categoryHierarchy !== null ?
							<div className="row">
	                            <div className="col-xl-12">
	                                <FormLine
			                            label={"New parent category"}
			                            type={"select"}
			                            options={this.state.categories.map(c => { return { "label": c.name, "value": c.name }})}
			                            value={this.state.newParentCategory}
			                            onChange={v => this.changeState("newParentCategory", v)}
			                        />
	                            </div>
	                            <div className="col-xl-12">
	                                <FormLine
			                            label={"New child category"}
			                            type={"select"}
			                            options={this.state.categories.map(c => { return { "label": c.name, "value": c.name }})}
			                            value={this.state.newChildCategory}
			                            onChange={v => this.changeState("newChildCategory", v)}
			                        />
	                            </div>
	                            <div className="col-xl-12 right-buttons">
	                                <button
	                                    className={"blue-background"}
	                                    onClick={this.addCategoryHierarchy}>
	                                    <i className="fas fa-plus"/> Add hierarchy
	                                </button>
	                            </div>
	                            <div className="col-xl-12">
		                            <Table
										columns={categoryHierarchyColumns}
										data={this.state.categoryHierarchy}
									/>
								</div>
	                        </div>
	                    :
	                    	<Loading
	                    		height={300}
	                    	/>
	                    }
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Category values</h2>
						{this.state.categories !== null ?
							<div className="row">
	                            <div className="col-xl-12">
	                                <FormLine
			                            label={"Category"}
			                            type={"select"}
			                            options={this.state.categories.map(c => { return { "label": c.name, "value": c.name }})}
			                            value={this.state.selectedCategory}
			                            onChange={v => this.changeState("selectedCategory", v)}
			                        />
	                            </div>
	                            {this.state.selectedCategory !== null ?
	                            	(this.state.values !== null ?
			                            <div className="col-xl-12">
				                            <FormLine
					                            label={"Add a new value"}
					                            value={this.state.newValue}
					                            onChange={v => this.changeState("newValue", v)}
					                        />
					                        <div className="col-xl-12 right-buttons">
				                                <button
				                                    className={"blue-background"}
				                                    onClick={this.addValue}>
				                                    <i className="fas fa-plus"/> Add value
				                                </button>
				                            </div>
				                            <Table
												columns={valueColumns}
												data={this.state.values}
											/>
										</div>
									: 
									<Loading
			                    		height={300}
			                    	/>)
								: ""}
	                        </div>
	                    :
	                    	<Loading
	                    		height={300}
	                    	/>
	                    }
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Value hierarchy</h2>
						{this.state.categoryHierarchy !== null ?
							<div className="row row-spaced">
	                            <div className="col-xl-12">
	                                <FormLine
			                            label={"Category relation"}
			                            type={"select"}
			                            options={this.state.categoryHierarchy.map(c => { 
			                            	return { 
			                            		"label": c.parent_category + " - " + c.child_category, 
			                            		"value": c.parent_category + " - " + c.child_category 
			                            	}
			                            })}
			                            value={this.state.selectedCategoryHierarchy}
			                            onChange={v => this.changeState("selectedCategoryHierarchy", v)}
			                        />
	                            </div>
	                        </div>
	                       :
	                    	<Loading
	                    		height={300}
	                    	/>
	                    }
                        {this.state.selectedCategoryHierarchy !== null ?
	                        (this.state.valueHierarchy !== null ?
                        		<div className="row row-spaced">
                            		<div className="col-xl-12">
			                            <DragDropContext onDragEnd={this.onDragEnd}>
			                            	<Droppable 
		                            			droppableId="null" 
		                            			direction="horizontal">
		                            			{(provided, snapshot) => (
										            <div
										            	ref={provided.innerRef}
										            	className="Droppable-horizontal-bar Droppable-horizontal-bar-unassigned"
										            	{...provided.droppableProps}>
										            	<div>Not assigned</div>
										              	{this.state.valueHierarchy.child_values
										              		.filter(v => this.state.valueHierarchy.value_hierarchy
										              			.map(h => { return h.child_value })
										              			.indexOf(v.id) < 0)
										              		.map((item, index) => { return (
											                <Draggable 
											                	key={"" + item.id} 
											                	draggableId={"" + item.id} 
											                	index={index}>
											                	{(provided, snapshot) => (
												                    <div
												                    	className="Droppable-element"
												                    	ref={provided.innerRef}
													                    {...provided.draggableProps}
													                    {...provided.dragHandleProps}
													                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
												                      	{item.name}
												                    </div>
												                )}
											                </Draggable>
										              	)})}
										              	{provided.placeholder}
										            </div>
										        )}
									        </Droppable>
			                            	{this.state.valueHierarchy.parent_values.map(pv => { return (
			                            		<Droppable 
			                            			droppableId={"" + pv.id}
			                            			direction="horizontal">
			                            			{(provided, snapshot) => (
											            <div
											            	ref={provided.innerRef}
											            	className="Droppable-horizontal-bar"
											            	{...provided.droppableProps}>
											            	<div>{pv.name}</div>
											              	{this.state.valueHierarchy.value_hierarchy
											              		.filter(v => pv.id === v.parent_value)
											              		.map((item, index) => { return (
												                <Draggable 
												                	key={"" + item.child_value} 
												                	draggableId={"" + item.child_value} 
												                	index={index}>
												                	{(provided, snapshot) => (
													                    <div
													                    	className="Droppable-element"
													                    	ref={provided.innerRef}
														                    {...provided.draggableProps}
														                    {...provided.dragHandleProps}
														                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
													                      	{this.state.valueHierarchy.child_values.filter(v => v.id === item.child_value)[0].name}
													                    </div>
													                )}
												                </Draggable>
											              	)})}
											              	{provided.placeholder}
											            </div>
											        )}
										        </Droppable>
			                            	)})}
									    </DragDropContext>
									</div>
								</div>
							: 
								<Loading
		                    		height={300}
		                    	/>
		                    )
						: ""}
					</div>
				</div>
			</div>
		);
	}
}