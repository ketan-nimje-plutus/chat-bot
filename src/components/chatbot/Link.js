import React from 'react'
import '../../App.css'
import { Table } from 'react-bootstrap'

const Link = () => {
  return (
    <div>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Useful Link</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>
              <a
                style={{ textDecoration: 'none' }}
                href="https://plutustec.com/"
                target="_blank"
              >
                Plutus Website
              </a>
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td>
              <a
                style={{ textDecoration: 'none' }}
                href="https://plutustec.com/contact-us/"
                target="_blank"
              >
                Plutus contacts
              </a>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  )
}

export default Link
