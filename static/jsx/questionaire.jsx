"use strict";

class Questionaire extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selectedCriteria: []}

        this.handleSelect = this.handleSelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSelect(event) {
        this.setState((prevState) => {
            return {
                selectedCriteria: prevState.selectedCriteria + [event.target.value]
            }
        });
    }

    handleSubmit(event) {
        const data = {
            'criteria': this.state.selectedCriteria
        };

        let fetchData = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
        };

        fetch('/api/questionaire', fetchData)
        .then(response => response.json())
        .then(data => {
            if (data['success'] === true) {
                alert('Your initial preferences have been sent')
            } else {
                alert('Error')
            }
        });
    }

    render(){
        const questions = [];
        
        this.props.category1.forEach((category) => {
            questions.push(
                <QuestionCat1 extCategory={category} />
            );
        });

        this.props.category2.forEach((category) => {
            questions.push(
                <QuestionCat2 extCategory={category} />
            );
        });

        return(
            <div>
                <header><h1>get started</h1></header>
                <h3>select criteria that is important to you</h3>
                <h5>feel free to skip any categories that do not apply to you</h5>
                <form>
                    {questions}
                    <button className="btn btn-primary" type="submit">Save</button>
                </form>
            </div>
      );
    }
  }


class QuestionCat1 extends React.Component {
    constructor(props) {
      super(props);
      this.state = {categoryOptions: [], 
                    selectedOption: ''};
  
    }
    componentDidMount() {
        const extCategory = this.props.extCategory;
        const optionsList = extCategory.options

        let categoryOptions = optionsList.map(catOption => {
            return {value: catOption, display: catOption}
        });
        this.setState  ({
            categoryOptions: [{value: '', display: 'Choose'}].concat(categoryOptions)
        });
    }
  
    render() {
        return (
                <div className='input-group mb-3'>
                    <div className='input-group-prepend'>
                        <label className='input-group-text' htmlFor={this.props.extCategory.dbPlaceType}>{this.props.extCategory.Q}</label>
                    </div>
                    <select className='custom-select' 
                            id={this.props.extCategory.dbPlaceType}
                            key={this.props.extCategory.dbPlaceType}
                            value = {this.selectedOption} 
                            onChange={e => this.setState({selectedOption: e.target.value})}>
                        {this.state.categoryOptions.map((catOption) => 
                        <option key={catOption.value} value={catOption.value}>{catOption.display}</option>)}
                    </select>
                </div>
        );
    }
  }

  class QuestionCat2 extends React.Component {
    constructor(props) {
      super(props);
      this.state = {categoryOptions: [], 
                    selectedOption: ''};
  
    }
    componentDidMount() {
        const extCategory = this.props.extCategory;
        
        const optionsList = Object.keys(extCategory.options)

        let categoryOptions = optionsList.map(catOption => {
    
            return {value: extCategory.options[catOption], display: catOption}
        });
        this.setState  ({
            categoryOptions: [{value: '', display: 'Choose'}].concat(categoryOptions)
        });
    }
  
    render() {
        const label = this.props.extCategory['label'];
        return (
                <div className='input-group mb-3'>
                    <div className='input-group-prepend'>
                        <label className='input-group-text' htmlFor={label}>{this.props.extCategory.Q}</label>
                    </div>
                    <select className='custom-select' 
                            id={label}
                            key={label}
                            onChange={this.props.handleSelect}>
                        {this.state.categoryOptions.map((catOption) => 
                        <option key={catOption.value} value={catOption.value}>{catOption.display}</option>)}
                    </select>
                </div>
        );
    }
  }

  

// ReactDOM.render(<Questionaire  
//                   category1={CATEGORY_SET1} category2={CATEGORY_SET2} />, document.getElementById('q'));