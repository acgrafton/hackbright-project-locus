class Questionaire extends React.Component {
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
                            value = {this.selectedOption} 
                            onChange={e => this.setState({selectedOption: e.target.value})}>
                        {this.state.categoryOptions.map((catOption) => 
                        <option key={catOption.value} value={catOption.value}>{catOption.display}</option>)}
                    </select>
                </div>
        );
    }
  }

  

ReactDOM.render(<Questionaire  
                  category1={CATEGORY_SET1} category2={CATEGORY_SET2} />, document.getElementById('q'));