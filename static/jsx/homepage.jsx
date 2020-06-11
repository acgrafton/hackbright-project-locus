class Homepage extends React.Component {
  render(){
    return(
      <div>
          <h1>Welcome!</h1>

          <h2>Enter location</h2>
          <form action="/search">
          <input type="search" id="search" name="address">
          </form>

            <h2>Create an Account</h2>
          <form action="/new_users" method="POST">
            <p>
              Email <input type="text" name="email">
            </p>

            <p>
              Password <input type="password" name="password">
            </p>

            <p>
              <input type="submit">
            </p>
          </form>

              <h2>Login</h2>
          <form action="/login">
            <p>
              Email <input type="text" name="email">
            </p>

            <p>
              Password <input type="password" name="password">
            </p>

            <p>
              <input type="submit">
            </p>
          </form>
        </div>
      )
  }
}

ReactDOM.render(<Homepage />, document.getElementById('app'));