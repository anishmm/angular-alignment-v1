import { Component, OnInit, VERSION } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  name = 'Alignment Demo';
  treeData = {
    id: '0',
    title: 'Root',
    fill: '#FFFFFF',
    percent: 50,
    obj: 'OBJ: Growth of Revenue',
    kra: [{ value: 'KR: Increase digital sales from 100 to 10000' }],
    img: 'https://source.unsplash.com/user/c_v_r/50x50',
    value: '500',
    maxValue: '1000',
    minValue: '1',
    precise: false,
    children: [
      {
        id: '01',
        title: 'Company',
        obj: 'OBJ :  Grow revenue in America Region ',
        kra: [
          {
            id: '111',
            value: 'KR 1 : Increase ARR from $2M to $4M',
          },
          { value: 'KR 2 : Increase ARR from $2M to $4M' },
          {
            id: '113',
            value: 'KR 3 : Increase ARR from $2M to $4M',
          },
          {
            id: '114',
            value: 'Increase Monthly Recurring Revenue (MRR) by $200,000',
          },
        ],
        percent: 10,
        img: 'https://source.unsplash.com/user/c_v_r/50x50',
        fill: '#FFFFFF',
        value: '10',
        maxValue: '500',
        minValue: '1',
        precise: false,
        children: [
          {
            id: '012',
            title: 'Sales team',
            fill: '#FFFABD',
            obj: 'OBJ : Sales Growth to be double',
            kra: [{ value: 'KR :Paid marketing  sales to go from 20 to 4000' }],
            percent: 20,
            img: 'https://source.unsplash.com/user/c_v_r/50x50',
            value: '20',
            maxValue: '100',
            minValue: '1',
            precise: true,
            children: [
              {
                id: '0121',
                title: 'Individual Vibhu',
                fill: '#FFFABD',
                obj: 'OBJ :  Get Tech projects',
                kra: [{ value: 'KR : Meet revenue goal of 2000' }],
                percent: 0,
                img: 'https://source.unsplash.com/user/c_v_r/50x50',
                value: '0',
                maxValue: '100',
                minValue: '1',
                precise: false,
              },
            ],
          },
          {
            id: '011',
            parentId: '111',
            title: 'Sales team 0',
            fill: '#FFFFFF',
            obj: 'KR 1 : Increase ARR from $2M to $4M',
            kra: [
              { value: 'KR : SEO sales to go from 20 to 2000' },
              {
                value:
                  'Average attainment of all company-level OKRs to be at least 70%',
              },
            ],
            percent: 20,
            img: 'https://source.unsplash.com/user/c_v_r/50x50',
            value: '20',
            maxValue: '500',
            minValue: '1',
            precise: false,
          },
          {
            id: '013',
            parentId: '113',
            title: 'Sales team 1',
            fill: '#FFFFFF',
            obj: 'KR 3 : Increase ARR from $2M to $4M',
            kra: [
              { value: 'KR : SEO sales to go from 20 to 2000' },
              {
                value:
                  'Average attainment of all company-level OKRs to be at least 70%',
              },
            ],
            percent: 20,
            img: 'https://source.unsplash.com/user/c_v_r/50x50',
            value: '20',
            maxValue: '500',
            minValue: '1',
            precise: false,
          },
          {
            id: '014',
            parentId: '114',
            title: 'Sales team 2',
            fill: '#FFFFFF',
            obj: 'Increase Monthly Recurring Revenue (MRR) by $200,000',
            kra: [
              { value: 'KR : SEO sales to go from 20 to 2000' },
              {
                value:
                  'Average attainment of all company-level OKRs to be at least 70%',
              },
            ],
            percent: 20,
            img: 'https://source.unsplash.com/user/c_v_r/50x50',
            value: '20',
            maxValue: '500',
            minValue: '1',
            precise: false,
          },
        ],
      },
      {
        id: '02',
        title: 'Company',
        fill: '#FFFABD',
        percent: 50,
        obj: 'OBJ : Growth of Revenue',
        kra: [{ value: 'KR : Increase tech sales from 200 to 20000' }],
        img: 'https://source.unsplash.com/user/c_v_r/50x50',
        value: '100000 USD',
        maxValue: '500',
        minValue: '0',
        precise: false,
        children: [
          {
            id: '021',
            title: 'Individual Rakesh',
            fill: '#FFFABD',
            obj: 'OBJ :  Meet all digital revenue growth ',
            kra: [{ value: 'KR : Bring seo projects of revenue 2000' }],
            percent: 20,
            img: 'https://source.unsplash.com/user/c_v_r/50x50',
            value: '20',
            maxValue: '500',
            minValue: '1',
            precise: false,
          },
          {
            id: '022',
            title: 'Individual Sam',
            fill: '#FFFABD',
            obj: 'OBJ : Help in getting Tech projects',
            kra: [{ value: 'KR :Do cross sales of tech for about 4000' }],
            percent: 20,
            img: 'https://source.unsplash.com/user/c_v_r/50x50',
            value: '20',
            maxValue: '100',
            minValue: '1',
            precise: false,
          },
        ],
      },
    ],
  };

  ngOnInit(): void {}
}
