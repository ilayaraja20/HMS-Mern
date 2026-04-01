import { useEffect,useState } from "react";
import api from "../services/api";
import { Paper,TextField,Button,Table,TableHead,TableRow,TableCell,TableBody } from "@mui/material";

function UserComplaints(){

  const [complaints,setComplaints] = useState([]);
  const [issue,setIssue] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchComplaints = async()=>{

    const res = await api.get(
      `/complaints/user/${userId}`
    );

    setComplaints(res.data);

  };

  useEffect(()=>{

    fetchComplaints();

  },[]);

  const submitComplaint = async()=>{

    await api.post(
      "/complaints",
      {
        studentId:userId,
        issue
      }
    );

    setIssue("");

    fetchComplaints();

  };

  return(

    <div style={{padding:"30px"}}>

      <h2>My Complaints</h2>

      <Paper style={{padding:"20px",marginBottom:"20px"}}>

        <TextField
          label="Complaint"
          fullWidth
          value={issue}
          onChange={(e)=>setIssue(e.target.value)}
        />

        <Button
          variant="contained"
          sx={{mt:2}}
          onClick={submitComplaint}
        >
          Submit
        </Button>

      </Paper>

      <Paper>

        <Table>

          <TableHead>

            <TableRow>
              <TableCell>Issue</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>

          </TableHead>

          <TableBody>

            {complaints.map(c=>(

              <TableRow key={c._id}>

                <TableCell>{c.issue}</TableCell>
                <TableCell>{c.status}</TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </Paper>

    </div>

  );

}

export default UserComplaints;
