import { Component, OnInit } from '@angular/core';
import { RelationsService } from '../_service/relations.service';
import { JdmService } from '../_service/jdm.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';


@Component({
  selector: 'app-search-engine',
  templateUrl: './search-engine.component.html',
  styleUrls: ['./search-engine.component.css']
})
export class SearchEngineComponent implements OnInit {
  private relationList = []
  prel = false;
  resjdm = false;
  lowerBound = 0;
  upperBound = 10;
  lowerBound2 = 0;
  upperBound2 = 10;
  private wordToSearch = "";
  searchText = new Subject();
  query = "";
  results: Observable<string[]>;
  nodes = [];
  inbounds = [];
  outgoing = [];
  data: any = [
   'red',
   'green',
   'blue',
   'cyan',
   'magenta',
   'yellow',
   'black',
];
  constructor(private relationsService: RelationsService, private jdmService : JdmService  ) { }

  ngOnInit(): void {

    this.relationsService.getRelations().subscribe(
      (relations : any[]) =>{
        console.log(relations);
        this.relationList = relations;
      }
    )
  }

  filter(value: string): string[] {
     const filterValue = value.toLowerCase();
         return this.data.filter((item: string) => item.toLowerCase().includes(filterValue));
   }


  updateData(data, value){
    switch(data){
       case "searchWord":
       this.wordToSearch = value;
       console.log("edit word : " + this.wordToSearch);
       console.log("length : " + this.wordToSearch.length );
       if(this.wordToSearch.length >= 3 || this.wordToSearch.length >= 6 ){
         console.log('ici')
         this.relationsService.getListMot(this.wordToSearch).subscribe(
           (res : any[]) =>{
             console.log(res);
           }
         )
       }
       break;
    }
  }

  requestJDM(){
    this.jdmService.reqJdm(this.wordToSearch).subscribe(
      (res : any)=>{
        this.nodes = res.nodes;
        this.inbounds = res.inbounds;
        this.outgoing = res.outgoing;

        console.log(this.nodes);
        console.log(this.inbounds);
        console.log(this.outgoing);
        this.printJdmRes();
      }
    )
  }

  printRelation(){
      if(this.prel){this.prel=false;}
      else{this.prel=true;}
  }

  printJdmRes(){
    for (let i = 0; i < this.inbounds.length; i++) {
        this.replaceIdByString(this.nodes, this.inbounds[i], this.inbounds[i].rwith);
        this.replaceRelIdByString(this.relationList, this.inbounds[i], this.inbounds[i].rtype);
    }
    this.inbounds.sort((a,b) => parseInt(a.weight)-parseInt(b.weight)).reverse();
    for (let i = 0; i < this.outgoing.length; i++) {
        this.replaceIdByString(this.nodes, this.outgoing[i], this.outgoing[i].rwith);
        this.replaceRelIdByString(this.relationList, this.outgoing[i], this.outgoing[i].rtype);

    }
    this.outgoing.sort((a,b) => parseInt(a.weight)-parseInt(b.weight)).reverse();
    this.resjdm = true;
  }

  replaceIdByString(nodes, relObj, id){
    for (let i = 0; i < nodes.length; i++) {
        if(nodes[i].id == id){
        //  console.log("id : " + id + " ->" + nodes[i].word);
          relObj.rwith = nodes[i].word;
        }
    }
  }

  replaceRelIdByString(rels, relObj, id){
    console.log(relObj);
    for(let i=0; i < rels.length; i++){
      if(rels[i][0] == id){
        relObj.rtype = rels[i][1];
      }
    }
  }

  findDefinition(rtype){
    let ret = "";
    let i = 0;
    while(this.relationList[i][1].localeCompare(rtype) !=0 && i < this.relationList.length){
      i++;
    }
  //  console.log("def found = " + this.relationList[i][2]);
    ret = this.relationList[i][2];
    return ret;
  }


  nextInbounds(){
    let temp = this.upperBound;
    if(  this.upperBound == this.inbounds.length-1){
      console.log("bloqué");
      ;
    }
    else if(this.upperBound < this.inbounds.length - 10){
    this.lowerBound = this.upperBound;
    this.upperBound += 10;
    console.log("new upper : " + this.upperBound);
    console.log("new lower : " + this.lowerBound);
  }else{
    this.lowerBound = this.upperBound;
    this.upperBound = this.inbounds.length -1;
    console.log("new upper : " + this.upperBound);
    console.log("new lower : " + this.lowerBound);
  }
}


  previousInbounds(){
    let temp = this.lowerBound;
    if(  this.lowerBound == 0){
      console.log("bloqué");

      ;
    }
    else if(this.lowerBound >= 10){
    this.upperBound = this.lowerBound;
    this.lowerBound -= 10;
    console.log("new upper : " + this.upperBound);
    console.log("new lower : " + this.lowerBound);

  }else{
    this.upperBound = this.lowerBound;
    this.lowerBound = 0
    console.log("new upper : " + this.upperBound);
    console.log("new lower : " + this.lowerBound);
  }

  }


  nextOutgoing(){
    let temp = this.upperBound2;
    if(  this.upperBound2 == this.outgoing.length-1){
      console.log("bloqué");
      ;
    }
    else if(this.upperBound2 < this.outgoing.length - 10){
    this.lowerBound2 = this.upperBound2;
    this.upperBound2 += 10;
    console.log("new upper : " + this.upperBound2);
    console.log("new lower : " + this.lowerBound2);
  }else{
    this.lowerBound2 = this.upperBound2;
    this.upperBound2 = this.outgoing.length -1;
    console.log("new upper : " + this.upperBound2);
    console.log("new lower : " + this.lowerBound2);
  }
}


  previousOutgoing(){
    let temp = this.lowerBound2;
    if(  this.lowerBound2 == 0){
      console.log("bloqué");

      ;
    }
    else if(this.lowerBound2 >= 10){
    this.upperBound2 = this.lowerBound2;
    this.lowerBound2 -= 10;
    console.log("new upper : " + this.upperBound2);
    console.log("new lower : " + this.lowerBound2);

  }else{
    this.upperBound2 = this.lowerBound2;
    this.lowerBound2 = 0
    console.log("new upper : " + this.upperBound2);
    console.log("new lower : " + this.lowerBound2);
  }

  }

  queryBuilder(id){
    if(this.query.length==0){
      this.query+=id;
    }else{
      if(this.query.includes("-"+id) ){

      }
      this.query+="-"+id;
      console.log("new query builder : " + this.query);
    }
  }


}
